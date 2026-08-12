import Phaser from "phaser";

import { MovementResult, MovementManager } from "./MovementManager";
import { DiceManager } from "./DiceManager";
import { GameSessionManager } from "./GameSessionManager";
import { PopupManager } from "./PopupManager";
import { UIManager } from "./UIManager";
import { TurnPhase } from "./TurnManager";
import { soundManager } from "../services/SoundManager";
import { DebugLogger } from "../utils/DebugLogger";
import { RecoveryManager, RecoveryRequest } from "./RecoveryManager";
import { QuestionAttemptFeedback } from "../ui/QuestionPopup";

export interface GameplayCoordinatorHooks {
    onWinner: (playerIndex: number) => void;
    onTileLanded?: (tileId: number) => void;
}

/**
 * מתאם את מחזור המשחק הפעיל: קובייה, תנועה, נחיתה, שאלה וסיום תור.
 * הסצנה אחראית רק לבניית רכיבים ולניווט בין מסכים.
 */
export class GameplayCoordinator {
    private gameEnded = false;
    private paused = false;
    private readonly recovery: RecoveryManager;

    constructor(
        private readonly scene: Phaser.Scene,
        private readonly session: GameSessionManager,
        private readonly dice: DiceManager,
        private readonly movement: MovementManager,
        private readonly popups: PopupManager,
        private readonly ui: UIManager,
        private readonly hooks: GameplayCoordinatorHooks
    ) {
        this.recovery = new RecoveryManager(scene, {
            getPhase: () => this.session.flow.getPhase(),
            onRecover: request => this.handleRecovery(request),
            onRepeatedFailure: request => {
                DebugLogger.error("RECOVERY", `Repeated recovery failure in ${request.phase}`);
                this.ui.showFeedback("אירעה תקלה חוזרת — המשחק אופס בבטחה", "#ffb3a7", 2600);
            }
        });
    }

    public start(): void {
        this.dice.create(
            value => this.handleDiceRolled(value),
            () => {
                const accepted = !this.paused && !this.popups.isBlocking() && this.session.flow.requestRoll();
                if (accepted) this.recovery.arm(TurnPhase.ROLLING, 5000, "dice roll did not finish");
                return accepted;
            }
        );
        this.session.start();
    }

    public isEnded(): boolean {
        return this.gameEnded;
    }

    public isPaused(): boolean {
        return this.paused;
    }

    public togglePause(): boolean {
        if (this.gameEnded || this.popups.isBlocking()) return this.paused;
        if (this.session.flow.getPhase() !== TurnPhase.READY) {
            this.ui.showFeedback("אפשר להשהות בין תורים", "#ffe28a", 1300);
            return this.paused;
        }
        this.paused = !this.paused;
        if (this.paused) {
            this.dice.disable("המשחק מושהה");
        } else {
            this.dice.enable();
        }
        return this.paused;
    }

    public suspendDice(label = "ממתינים"): void {
        this.dice.disable(label);
    }

    public resumeDice(): void {
        if (!this.gameEnded && !this.paused && !this.popups.isBlocking() && this.session.flow.getPhase() === TurnPhase.READY) {
            this.dice.enable();
        }
    }

    public finishGame(playerIndex: number): void {
        if (this.gameEnded) return;

        this.gameEnded = true;
        this.paused = false;
        this.recovery.markHealthy();
        soundManager.playWin();
        if (!this.session.flow.finishGame()) {
            DebugLogger.warn("SYSTEM", "Duplicate game-finish request ignored");
            return;
        }
        this.dice.disable("המשחק הסתיים");
        this.hooks.onWinner(playerIndex);
    }

    public destroy(): void {
        this.recovery.destroy();
        this.movement.cancelMovement();
        this.dice.destroy();
        this.gameEnded = true;
        this.paused = false;
    }

    private handleDiceRolled(value: number): void {
        if (this.gameEnded || !this.session.flow.confirmRoll()) return;
        this.recovery.markHealthy();

        const playerIndex = this.session.turns.getCurrentPlayer();
        this.session.stats.registerTurn(playerIndex);
        this.dice.disable("גררו את החייל למשבצת המסומנת");
        this.ui.updateDice(value);

        this.movement.movePlayer(
            playerIndex,
            value,
            result => this.handleMovementFinished(result)
        );

        this.recovery.arm(TurnPhase.MOVING, 45000, "movement did not complete");
    }

    private handleMovementFinished(result: MovementResult): void {
        const playerIndex = this.session.turns.getCurrentPlayer();
        this.ui.updatePlayerTile(playerIndex, result.tile.id);
        this.recovery.markHealthy();

        if (this.gameEnded) return;

        this.hooks.onTileLanded?.(result.tile.id);

        const action = this.session.landing.begin(result);
        if (action === "ignored") return;

        if (action === "winner") {
            this.session.win.tryDeclareWinner(playerIndex);
            return;
        }

        if (!this.session.flow.confirmLanding()) {
            this.session.landing.complete();
            return;
        }

        this.openQuestion(result.tile.questionGroup);
    }

    private openQuestion(questionGroup: string): void {
        if (this.gameEnded) return;

        const question = this.session.questions.beginQuestion(questionGroup);
        if (!question) {
            this.recoverReadyState();
            return;
        }

        const correctAnswerIndex = question.answers.findIndex(
            answer => answer.id === question.correctAnswer
        );

        const opened = this.popups.showQuestion(
            question.text,
            question.answers.map(answer => answer.text),
            correctAnswerIndex,
            answerIndex => this.handleAnswer(answerIndex),
            () => this.completeAnsweredTurn()
        );

        if (!opened) {
            this.recoverReadyState("question popup could not open");
            return;
        }

        // אין מגבלת זמן למענה: תלמידים רשאים לחשוב ללא שעון התאוששות.
        this.recovery.markHealthy();
    }

    private handleAnswer(answerIndex: number): QuestionAttemptFeedback | undefined {
        this.recovery.markHealthy();
        const answerResult = this.session.questions.resolveAnswer(answerIndex);
        if (!answerResult) return undefined;

        const playerIndex = this.session.turns.getCurrentPlayer();
        this.session.answers.resolve(playerIndex, answerResult);

        if (answerResult.final) {
            if (!this.session.flow.confirmAnswer()) return undefined;
            this.session.questions.clear();
            this.session.landing.complete();
            this.recovery.arm(TurnPhase.RESOLVING, 8000, "turn resolution did not complete");
        }

        return {
            correct: answerResult.correct,
            final: answerResult.final,
            remainingAttempts: answerResult.remainingAttempts
        };
    }

    private completeAnsweredTurn(): void {
        if (this.gameEnded || this.session.flow.getPhase() !== TurnPhase.RESOLVING) return;
        this.endTurn();
    }

    private endTurn(): void {
        if (this.gameEnded) return;

        this.session.landing.complete();
        const nextPlayer = this.session.flow.finishTurn();
        if (nextPlayer === undefined) {
            DebugLogger.warn("TURN", "Turn completion rejected; recovering to READY");
            this.session.flow.recoverTurn("invalid turn completion");
        }
        this.recovery.markHealthy();
        if (!this.paused) this.dice.enable();
    }

    private recoverReadyState(reason = "question recovery"): void {
        this.recovery.markHealthy();
        this.popups.closeQuestion();
        this.session.questions.clear();
        this.session.landing.complete();
        this.session.flow.recoverTurn(reason);
        if (!this.paused && !this.gameEnded) this.dice.enable();
    }

    private handleRecovery(request: RecoveryRequest): void {
        if (this.gameEnded) return;

        const messages: Partial<Record<TurnPhase, string>> = {
            [TurnPhase.ROLLING]: "הקובייה אופסה — אפשר לזרוק שוב",
            [TurnPhase.MOVING]: "המהלך אופס — אפשר לזרוק שוב",
            [TurnPhase.RESOLVING]: "סיום התור אופס — אפשר להמשיך"
        };

        this.ui.showFeedback(
            messages[request.phase] ?? "המשחק התאושש מתקלה זמנית",
            "#ffe28a",
            2200
        );

        this.movement.cancelMovement();
        this.dice.recover();
        this.popups.closeQuestion();
        this.session.questions.clear();
        this.session.landing.reset();
        this.session.flow.recoverTurn(`watchdog: ${request.reason}`);
        if (!this.paused) this.dice.enable();
    }
}

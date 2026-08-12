import { DebugLogger } from "../utils/DebugLogger";

export enum TurnPhase {
    READY = "ready",
    ROLLING = "rolling",
    MOVING = "moving",
    QUESTION = "question",
    RESOLVING = "resolving",
    ENDED = "ended"
}

/**
 * מקור האמת היחיד למצב התור. כל מעבר מצב עובר דרך המחלקה הזו,
 * כדי למנוע גלגול, תנועה, שאלה או מעבר תור כפולים.
 */
export class TurnManager {
    private currentPlayer = 0;
    private phase = TurnPhase.READY;

    constructor(private readonly playerCount: number) {
        if (!Number.isInteger(playerCount) || playerCount < 1) {
            throw new Error("TurnManager requires at least one player");
        }
    }

    public getCurrentPlayer(): number {
        return this.currentPlayer;
    }

    public getPhase(): TurnPhase {
        return this.phase;
    }

    public is(phase: TurnPhase): boolean {
        return this.phase === phase;
    }

    public beginRoll(): boolean {
        return this.transition(TurnPhase.READY, TurnPhase.ROLLING, "dice roll");
    }

    public beginMovement(): boolean {
        return this.transition(TurnPhase.ROLLING, TurnPhase.MOVING, "movement");
    }

    public beginQuestion(): boolean {
        return this.transition(TurnPhase.MOVING, TurnPhase.QUESTION, "question");
    }

    public beginResolution(): boolean {
        return this.transition(TurnPhase.QUESTION, TurnPhase.RESOLVING, "answer resolution");
    }

    /**
     * מעבר לשחקן הבא מותר רק לאחר פתרון תשובה.
     * ערך undefined מציין שנחסם ניסיון כפול או ניסיון בשלב שגוי.
     */
    public completeTurn(): number | undefined {
        if (this.phase !== TurnPhase.RESOLVING) {
            DebugLogger.warn("TURN", `Blocked turn completion while phase is ${this.phase}`);
            return undefined;
        }

        const previousPlayer = this.currentPlayer;
        this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
        this.phase = TurnPhase.READY;
        DebugLogger.info("TURN", `Player ${previousPlayer + 1} -> Player ${this.currentPlayer + 1}`);
        DebugLogger.info("STATE", `${TurnPhase.RESOLVING} -> ${TurnPhase.READY}`);
        return this.currentPlayer;
    }

    public recoverToReady(reason = "recovery"): boolean {
        if (this.phase === TurnPhase.ENDED) {
            DebugLogger.warn("STATE", `Blocked recovery from ${TurnPhase.ENDED}`);
            return false;
        }

        const previous = this.phase;
        this.phase = TurnPhase.READY;
        DebugLogger.warn("STATE", `${previous} -> ${TurnPhase.READY} (${reason})`);
        return true;
    }

    public endGame(): boolean {
        if (this.phase === TurnPhase.ENDED) {
            DebugLogger.warn("STATE", "Blocked duplicate game end");
            return false;
        }

        const previous = this.phase;
        this.phase = TurnPhase.ENDED;
        DebugLogger.info("STATE", `${previous} -> ${TurnPhase.ENDED}`);
        return true;
    }

    public reset(): void {
        this.currentPlayer = 0;
        this.phase = TurnPhase.READY;
        DebugLogger.info("SYSTEM", "Turn manager reset");
    }

    private transition(from: TurnPhase, to: TurnPhase, action: string): boolean {
        if (this.phase !== from) {
            DebugLogger.warn("STATE", `Blocked ${action}: expected ${from}, actual ${this.phase}`);
            return false;
        }

        this.phase = to;
        DebugLogger.info("STATE", `${from} -> ${to}`);
        return true;
    }
}

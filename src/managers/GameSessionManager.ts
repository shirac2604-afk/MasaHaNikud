import { AnswerResolutionManager } from "./AnswerResolutionManager";
import { GameFlowManager, GameFlowHooks } from "./GameFlowManager";
import { GameStatsManager } from "./GameStatsManager";
import { LandingResolutionManager } from "./LandingResolutionManager";
import { QuestionManager } from "./QuestionManager";
import { ScoreManager } from "./ScoreManager";
import { TurnManager } from "./TurnManager";
import { UIManager } from "./UIManager";
import { WinManager, WinManagerHooks } from "./WinManager";

export interface GameSessionOptions {
    playerCount: number;
    flowHooks: GameFlowHooks;
    winHooks: WinManagerHooks;
    uiManager: UIManager;
}

/**
 * נקודת הרכבה אחת לכל מנהלי מצב המשחק.
 * המחלקה אינה מציירת ואינה מפעילה תנועה; היא מחזיקה את המנהלים
 * שחייבים לחלוק מחזור חיים משותף ומבטיחה אתחול וניקוי עקביים.
 */
export class GameSessionManager {
    public readonly turns: TurnManager;
    public readonly flow: GameFlowManager;
    public readonly score: ScoreManager;
    public readonly stats: GameStatsManager;
    public readonly win: WinManager;
    public readonly landing: LandingResolutionManager;
    public readonly questions: QuestionManager;
    public readonly answers: AnswerResolutionManager;

    constructor(options: GameSessionOptions) {
        this.turns = new TurnManager(options.playerCount);
        this.flow = new GameFlowManager(this.turns, options.flowHooks);
        this.score = new ScoreManager();
        this.stats = new GameStatsManager();
        this.win = new WinManager(options.winHooks);
        this.landing = new LandingResolutionManager();
        this.questions = new QuestionManager();
        this.answers = new AnswerResolutionManager(
            this.score,
            this.stats,
            options.uiManager
        );
    }

    public start(): void {
        this.score.create();
        this.stats.start();
        this.flow.start();
    }

    public destroy(): void {
        this.questions.clear();
        this.landing.reset();
        this.win.destroy();
    }
}

import { GameStatsManager } from "./GameStatsManager";
import { ScoreManager } from "./ScoreManager";
import { UIManager } from "./UIManager";
import { QuestionAnswerResult } from "./QuestionManager";
import { soundManager } from "../services/SoundManager";

export interface AnswerResolution {
    correct: boolean;
    awardedPoints: number;
    final: boolean;
}

/** מרכז ניקוד, סטטיסטיקה, צליל ומשוב לכל ניסיון מענה. */
export class AnswerResolutionManager {
    private static readonly CORRECT_ANSWER_POINTS = 10;

    constructor(
        private readonly scoreManager: ScoreManager,
        private readonly statsManager: GameStatsManager,
        private readonly uiManager: UIManager
    ) {}

    public resolve(playerIndex: number, result: QuestionAnswerResult): AnswerResolution {
        if (result.correct) {
            this.statsManager.registerAnswer(playerIndex, true, result.attemptNumber);
            soundManager.playCorrect();
            this.scoreManager.addPoints(playerIndex, AnswerResolutionManager.CORRECT_ANSWER_POINTS);
            this.uiManager.registerCorrectAnswer(playerIndex);
            this.uiManager.celebrateAnswer();
            this.uiManager.showFeedback(
                result.attemptNumber === 1
                    ? `🎉 תשובה נכונה! קיבלת ${AnswerResolutionManager.CORRECT_ANSWER_POINTS} נקודות`
                    : `🌟 הצלחת בניסיון השני! קיבלת ${AnswerResolutionManager.CORRECT_ANSWER_POINTS} נקודות`,
                "#8cff8c",
                1700
            );
            return { correct: true, awardedPoints: AnswerResolutionManager.CORRECT_ANSWER_POINTS, final: true };
        }

        soundManager.playWrong();
        if (!result.final) {
            this.uiManager.encourageRetry();
            this.uiManager.showFeedback("כמעט! יש לך הזדמנות נוספת", "#ffe28a", 1500);
            return { correct: false, awardedPoints: 0, final: false };
        }

        this.statsManager.registerAnswer(playerIndex, false);
        this.uiManager.refreshScores();
        this.uiManager.showFeedback("לא נורא — לומדים וממשיכים", "#ffb6a8", 1700);
        return { correct: false, awardedPoints: 0, final: true };
    }
}

import { Question } from "../models/Question";
import { QuestionService } from "../services/QuestionService";
import { DebugLogger } from "../utils/DebugLogger";

export interface QuestionAnswerResult {
    question: Question;
    answerIndex: number;
    answerId: number;
    correct: boolean;
    attemptNumber: number;
    remainingAttempts: number;
    final: boolean;
}

/**
 * מקור האמת של מחזור השאלה הפעילה.
 * המנהל בוחר שאלה, מונע פתיחה כפולה ומאמת את התשובה לפי מזהה התשובה.
 */
export class QuestionManager {
    private readonly service = new QuestionService();
    private currentQuestion?: Question;
    private answered = false;
    private attempts = 0;
    private static readonly MAX_ATTEMPTS = 2;

    public beginQuestion(groupId: string): Question | undefined {
        if (this.currentQuestion) {
            DebugLogger.warn("QUESTION", "Blocked duplicate question opening");
            return undefined;
        }

        this.currentQuestion = this.service.getQuestion(groupId);
        if (!this.currentQuestion) {
            DebugLogger.error("QUESTION", `Question group unavailable: ${groupId}`);
            return undefined;
        }
        this.answered = false;
        this.attempts = 0;
        DebugLogger.info("QUESTION", `Question opened for ${groupId}`);
        return this.currentQuestion;
    }

    public resolveAnswer(answerIndex: number): QuestionAnswerResult | undefined {
        if (!this.currentQuestion || this.answered) {
            DebugLogger.warn("QUESTION", "Blocked duplicate or inactive answer");
            return undefined;
        }

        const answer = this.currentQuestion.answers[answerIndex];
        if (!answer) {
            DebugLogger.warn("QUESTION", `Blocked invalid answer index ${answerIndex}`);
            return undefined;
        }

        this.attempts += 1;
        const correct = answer.id === this.currentQuestion.correctAnswer;
        const final = correct || this.attempts >= QuestionManager.MAX_ATTEMPTS;
        this.answered = final;
        const remainingAttempts = Math.max(0, QuestionManager.MAX_ATTEMPTS - this.attempts);
        DebugLogger.info(
            "QUESTION",
            `Answer accepted: index ${answerIndex}, attempt ${this.attempts}, final=${final}`
        );
        return {
            question: this.currentQuestion,
            answerIndex,
            answerId: answer.id,
            correct,
            attemptNumber: this.attempts,
            remainingAttempts,
            final
        };
    }

    public getCurrentQuestion(): Question | undefined {
        return this.currentQuestion;
    }

    public isActive(): boolean {
        return Boolean(this.currentQuestion);
    }

    public clear(): void {
        this.currentQuestion = undefined;
        this.answered = false;
        this.attempts = 0;
    }
}

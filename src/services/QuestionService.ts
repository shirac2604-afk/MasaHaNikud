import { Question } from "../models/Question";
import { questionBankRegistry } from "../data/questionBanks/QuestionBankRegistry";
import { DebugLogger } from "../utils/DebugLogger";

/**
 * Selects questions by the exact board-tile group and avoids repetition until
 * every question in that group has been used.
 */
export class QuestionService {
    private readonly remainingIds = new Map<string, number[]>();

    public getQuestion(groupId: string): Question | undefined {
        const group = questionBankRegistry.getGroup(groupId);
        if (group.length === 0) {
            DebugLogger.error("QUESTION", `No questions found for group ${groupId}`);
            return undefined;
        }

        let remaining = this.remainingIds.get(groupId);
        if (!remaining || remaining.length === 0) {
            remaining = this.shuffle(group.map(question => question.id));
            this.remainingIds.set(groupId, remaining);
        }

        const id = remaining.pop();
        const question = group.find(item => item.id === id);
        if (!question) {
            DebugLogger.error("QUESTION", `Question ${id} was not found in group ${groupId}`);
            this.remainingIds.delete(groupId);
            return group[0];
        }

        return question;
    }

    public resetGroup(groupId: string): void {
        this.remainingIds.delete(groupId);
    }

    public resetAll(): void {
        this.remainingIds.clear();
    }

    private shuffle<T>(values: T[]): T[] {
        for (let index = values.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
        }
        return values;
    }
}

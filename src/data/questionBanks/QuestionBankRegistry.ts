import kamatzPatach from "./kamatz-patach.json";
import segolTzere from "./segol-tzere.json";
import hirik from "./hirik.json";
import holam from "./holam.json";
import shurukKubutz from "./shuruk-kubutz.json";
import masaHanikud from "./masa-hanikud.json";
import { Question } from "../../models/Question";

interface QuestionBankFile {
    schemaVersion: number;
    boardId: string;
    version: string;
    groups: Record<string, Question[]>;
}

const files = [kamatzPatach, segolTzere, hirik, holam, shurukKubutz, masaHanikud] as unknown as QuestionBankFile[];

class QuestionBankRegistry {
    private readonly groups = new Map<string, readonly Question[]>();

    constructor() {
        for (const file of files) {
            for (const [groupId, questions] of Object.entries(file.groups)) {
                if (this.groups.has(groupId)) throw new Error(`Duplicate question group: ${groupId}`);
                if (questions.length > 0) this.validateGroup(groupId, questions);
                this.groups.set(groupId, Object.freeze(questions.map(question => Object.freeze(question))));
            }
        }
    }

    public getGroup(groupId: string): readonly Question[] {
        return this.groups.get(groupId) ?? [];
    }

    public hasGroup(groupId: string): boolean {
        return this.groups.has(groupId) && (this.groups.get(groupId)?.length ?? 0) > 0;
    }

    public getGroupCount(): number { return this.groups.size; }

    private validateGroup(groupId: string, questions: Question[]): void {
        const ids = new Set<number>();
        for (const question of questions) {
            if (question.groupId !== groupId) throw new Error(`Question ${question.id} belongs to wrong group`);
            if (ids.has(question.id)) throw new Error(`Duplicate question id ${question.id}`);
            ids.add(question.id);
            if (question.answers.length < 2) throw new Error(`Question ${question.id} has too few answers`);
            if (!question.answers.some(answer => answer.id === question.correctAnswer)) {
                throw new Error(`Question ${question.id} has invalid correct answer`);
            }
        }
    }
}

export const questionBankRegistry = new QuestionBankRegistry();

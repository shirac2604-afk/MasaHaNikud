export type QuestionKind = "identify" | "find-nikud" | "choose-example" | "complete-word";

export interface Answer {
    id: number;
    text: string;
}

export interface Question {
    id: number;
    text: string;
    answers: Answer[];
    correctAnswer: number;
    difficulty: 1 | 2 | 3;
    boardId?: string;
    groupId?: string;
    learningGoal?: string;
    kind?: QuestionKind;
    symbol?: string;
}

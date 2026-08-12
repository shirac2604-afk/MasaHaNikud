import Phaser from "phaser";
import { PlayerGameStats } from "./GameStatsManager";
import { QuestionAttemptFeedback, QuestionPopup } from "../ui/QuestionPopup";
import { WinPopup } from "../ui/WinPopup";
import { ExitConfirmPopup } from "../ui/ExitConfirmPopup";

export interface WinnerPresentation {
    winnerIndex: number;
    elapsedSeconds: number;
    players: PlayerGameStats[];
}

export enum PopupKind {
    NONE = "NONE",
    QUESTION = "QUESTION",
    EXIT = "EXIT",
    WIN = "WIN"
}

/** מקור יחיד ליצירה, פתיחה, חסימה וסגירה של חלונות המשחק. */
export class PopupManager {
    private readonly questionPopup: QuestionPopup;
    private readonly winPopup: WinPopup;
    private readonly exitPopup: ExitConfirmPopup;
    private activePopup = PopupKind.NONE;
    private destroyed = false;

    constructor(private readonly scene: Phaser.Scene) {
        this.questionPopup = new QuestionPopup(scene);
        this.winPopup = new WinPopup(scene);
        this.exitPopup = new ExitConfirmPopup(scene);
    }

    public showQuestion(
        question: string,
        answers: string[],
        correctAnswerIndex: number,
        onAnswer: (answerIndex: number) => QuestionAttemptFeedback | undefined,
        onResolved: () => void
    ): boolean {
        if (this.destroyed || this.activePopup === PopupKind.WIN || this.activePopup === PopupKind.EXIT) return false;
        this.closeQuestion();
        this.activePopup = PopupKind.QUESTION;
        this.questionPopup.show(
            question,
            answers,
            correctAnswerIndex,
            answerIndex => onAnswer(answerIndex),
            () => {
                if (this.activePopup === PopupKind.QUESTION) this.activePopup = PopupKind.NONE;
                onResolved();
            }
        );
        return true;
    }

    public showWinner(summary: WinnerPresentation, onRestart: () => void, onMenu: () => void): void {
        if (this.destroyed) return;
        this.closeAllImmediately();
        this.activePopup = PopupKind.WIN;
        this.winPopup.show(summary, onRestart, onMenu);
    }

    public showExit(onConfirm: () => void, onCancel?: () => void): boolean {
        if (this.destroyed || this.isBlocking() || this.activePopup === PopupKind.WIN) return false;
        this.activePopup = PopupKind.EXIT;
        this.exitPopup.show(
            () => {
                this.activePopup = PopupKind.NONE;
                onConfirm();
            },
            () => {
                this.activePopup = PopupKind.NONE;
                onCancel?.();
            }
        );
        return true;
    }

    public getActivePopup(): PopupKind {
        return this.activePopup;
    }

    public isBlocking(): boolean {
        return this.activePopup !== PopupKind.NONE;
    }

    public isExitOpen(): boolean {
        return this.activePopup === PopupKind.EXIT && this.exitPopup.isOpen();
    }

    public closeExit(): void {
        if (!this.exitPopup.isOpen()) return;
        this.exitPopup.close(() => {
            if (this.activePopup === PopupKind.EXIT) this.activePopup = PopupKind.NONE;
        });
    }

    public closeQuestion(): void {
        this.questionPopup.reset();
        if (this.activePopup === PopupKind.QUESTION) this.activePopup = PopupKind.NONE;
    }

    public closeAllImmediately(): void {
        this.questionPopup.reset();
        this.exitPopup.hideImmediately();
        this.winPopup.hideImmediately();
        this.activePopup = PopupKind.NONE;
    }

    public destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.closeAllImmediately();
        this.questionPopup.destroy(true);
        this.winPopup.destroy(true);
        this.exitPopup.destroy(true);
    }
}

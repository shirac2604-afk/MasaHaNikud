import Phaser from "phaser";

import { BasePopup } from "./BasePopup";

export interface QuestionAttemptFeedback {
    correct: boolean;
    final: boolean;
    remainingAttempts: number;
}

/** חלון שאלות עם ניסיון נוסף לפני חשיפת הפתרון. */
export class QuestionPopup extends BasePopup {
    private readonly titleText: Phaser.GameObjects.Text;
    private readonly questionText: Phaser.GameObjects.Text;
    private readonly progressText: Phaser.GameObjects.Text;
    private readonly feedbackText: Phaser.GameObjects.Text;
    private readonly answersContainer: Phaser.GameObjects.Container;

    private answerCallback?: (answerIndex: number) => QuestionAttemptFeedback | undefined;
    private resolvedCallback?: () => void;
    private answerButtons: Phaser.GameObjects.Container[] = [];
    private answerBackgrounds: Phaser.GameObjects.Rectangle[] = [];
    private locked = false;
    private correctAnswerIndex = -1;
    private feedbackTimer?: Phaser.Time.TimerEvent;
    private rejectedAnswers = new Set<number>();

    constructor(scene: Phaser.Scene) {
        super(scene, 820, 590);
        this.panel.setFillStyle(0xfffbef, 1).setStrokeStyle(6, 0xe8bd61);
        const header = scene.add.rectangle(0, -252, 760, 72, 0x173f5f, 1).setStrokeStyle(2, 0xe8bd61);
        this.titleText = scene.add.text(0, -252, "שאלת הניקוד", {
            fontFamily: "Arial", fontSize: "35px", color: "#fff4c9", fontStyle: "bold", align: "center", rtl: true
        }).setOrigin(0.5);
        this.progressText = scene.add.text(350, -252, "בחרו תשובה", {
            fontFamily: "Arial", fontSize: "16px", color: "#d9e9f5", fontStyle: "bold", rtl: true
        }).setOrigin(1, 0.5);
        this.questionText = scene.add.text(0, -155, "", {
            fontFamily: "Arial", fontSize: "31px", color: "#17324d", fontStyle: "bold", align: "center", rtl: true,
            wordWrap: { width: 700, useAdvancedWrap: true }, lineSpacing: 8
        }).setOrigin(0.5);
        this.answersContainer = scene.add.container(0, 55);
        this.feedbackText = scene.add.text(0, 245, "", {
            fontFamily: "Arial", fontSize: "23px", color: "#17324d", fontStyle: "bold", align: "center", rtl: true
        }).setOrigin(0.5).setAlpha(0);
        this.add([header, this.titleText, this.progressText, this.questionText, this.answersContainer, this.feedbackText]);
    }

    public show(
        questionText: string,
        answers: string[],
        correctAnswerIndex: number,
        onAnswer: (answerIndex: number) => QuestionAttemptFeedback | undefined,
        onResolved?: () => void
    ): void {
        if (answers.length === 0) throw new Error("QuestionPopup requires at least one answer.");
        if (this.isOpen()) this.hideImmediately();
        this.feedbackTimer?.remove(false);
        this.answerCallback = onAnswer;
        this.resolvedCallback = onResolved;
        this.locked = false;
        this.rejectedAnswers.clear();
        this.correctAnswerIndex = correctAnswerIndex;
        this.questionText.setText(questionText);
        this.progressText.setText("בחרו תשובה");
        this.feedbackText.setText("").setAlpha(0);
        this.createAnswerButtons(answers);
        this.open();
    }

    public reset(): void {
        this.feedbackTimer?.remove(false);
        this.hideImmediately();
        this.locked = false;
        this.rejectedAnswers.clear();
        this.answerCallback = undefined;
        this.resolvedCallback = undefined;
        this.questionText.setText("");
        this.feedbackText.setText("").setAlpha(0);
        this.clearAnswerButtons();
    }

    public destroy(fromScene?: boolean): void {
        this.feedbackTimer?.remove(false);
        this.clearAnswerButtons();
        this.answerCallback = undefined;
        this.resolvedCallback = undefined;
        super.destroy(fromScene);
    }

    private createAnswerButtons(answers: string[]): void {
        this.clearAnswerButtons();
        const buttonWidth = 680;
        const buttonHeight = 62;
        const spacing = 74;
        const startY = -((answers.length - 1) * spacing) / 2;
        answers.forEach((answer, index) => {
            const background = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0xf4f8fc, 1)
                .setStrokeStyle(3, 0x6d91ad).setInteractive({ useHandCursor: true });
            const numberBadge = this.scene.add.circle(302, 0, 21, 0x173f5f, 1).setStrokeStyle(2, 0xe8bd61);
            const numberText = this.scene.add.text(302, 0, String(index + 1), {
                fontFamily: "Arial", fontSize: "19px", color: "#fff4c9", fontStyle: "bold"
            }).setOrigin(0.5);
            const answerText = this.scene.add.text(0, 0, answer, {
                fontFamily: "Arial", fontSize: "24px", color: "#17324d", align: "center", rtl: true,
                wordWrap: { width: buttonWidth - 105, useAdvancedWrap: true }
            }).setOrigin(0.5);
            const button = this.scene.add.container(0, startY + index * spacing, [background, numberBadge, numberText, answerText]);
            background.on("pointerover", () => {
                if (this.locked || this.rejectedAnswers.has(index)) return;
                background.setFillStyle(0xe4f1fb).setStrokeStyle(3, 0xe8bd61);
                this.scene.tweens.add({ targets: button, scaleX: 1.018, scaleY: 1.018, duration: 90 });
            });
            background.on("pointerout", () => {
                if (this.locked || this.rejectedAnswers.has(index)) return;
                background.setFillStyle(0xf4f8fc).setStrokeStyle(3, 0x6d91ad);
                this.scene.tweens.add({ targets: button, scaleX: 1, scaleY: 1, duration: 90 });
            });
            background.on("pointerdown", () => this.selectAnswer(index));
            this.answerButtons.push(button);
            this.answerBackgrounds.push(background);
            this.answersContainer.add(button);
        });
    }

    private selectAnswer(answerIndex: number): void {
        if (this.locked || this.rejectedAnswers.has(answerIndex)) return;
        const result = this.answerCallback?.(answerIndex);
        if (!result) return;
        this.locked = true;
        this.disableAnswerButtons();

        if (result.correct) {
            this.answerBackgrounds[answerIndex]?.setFillStyle(0xdaf4df).setStrokeStyle(4, 0x2e9d52);
            this.progressText.setText("תשובה נכונה");
            this.showFeedback("🎉 כל הכבוד! תשובה נכונה", "#247b3d");
            this.feedbackTimer = this.scene.time.delayedCall(1150, () => this.close(this.resolvedCallback));
            return;
        }

        this.answerBackgrounds[answerIndex]?.setFillStyle(0xf9dddd).setStrokeStyle(4, 0xc84a4a);
        if (!result.final && result.remainingAttempts > 0) {
            this.rejectedAnswers.add(answerIndex);
            this.progressText.setText("ניסיון נוסף");
            this.showFeedback("כמעט! חשבו שוב ובחרו תשובה אחרת", "#9a6816");
            this.scene.tweens.add({ targets: this.answerButtons[answerIndex], x: { from: -8, to: 8 }, yoyo: true, repeat: 2, duration: 65 });
            this.feedbackTimer = this.scene.time.delayedCall(850, () => {
                this.locked = false;
                this.enableAvailableAnswers();
            });
            return;
        }

        this.answerBackgrounds.forEach((background, index) => {
            if (index === this.correctAnswerIndex) background.setFillStyle(0xdaf4df).setStrokeStyle(4, 0x2e9d52);
            else if (index !== answerIndex) background.setAlpha(0.58);
        });
        this.progressText.setText("נלמד ונמשיך");
        this.showFeedback("עכשיו אפשר לראות את התשובה הנכונה בירוק", "#9b3434");
        this.feedbackTimer = this.scene.time.delayedCall(1450, () => this.close(this.resolvedCallback));
    }

    private showFeedback(message: string, color: string): void {
        this.feedbackText.setText(message).setColor(color).setAlpha(0).setY(245);
        this.scene.tweens.add({ targets: this.feedbackText, alpha: 1, y: 238, duration: 180, ease: "Back.Out" });
    }

    private disableAnswerButtons(): void {
        this.answerBackgrounds.forEach(background => background.disableInteractive());
    }

    private enableAvailableAnswers(): void {
        this.answerBackgrounds.forEach((background, index) => {
            if (!this.rejectedAnswers.has(index)) background.setInteractive({ useHandCursor: true });
        });
    }

    private clearAnswerButtons(): void {
        this.answerButtons.forEach(button => {
            this.scene.tweens.killTweensOf(button);
            button.each((child: Phaser.GameObjects.GameObject) => child.removeAllListeners());
            button.destroy(true);
        });
        this.answerButtons = [];
        this.answerBackgrounds = [];
        this.answersContainer.removeAll(false);
    }
}

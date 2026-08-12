import Phaser from "phaser";
import { BasePopup } from "./BasePopup";

export class ExitConfirmPopup extends BasePopup {
    private readonly titleText: Phaser.GameObjects.Text;
    private readonly messageText: Phaser.GameObjects.Text;
    private readonly confirmButton: Phaser.GameObjects.Container;
    private readonly cancelButton: Phaser.GameObjects.Container;
    private confirmCallback?: () => void;
    private cancelCallback?: () => void;

    constructor(scene: Phaser.Scene) {
        super(scene, 560, 330);

        this.titleText = scene.add.text(0, -105, "יציאה מהמשחק", {
            fontFamily: "Arial",
            fontSize: "38px",
            color: "#f3c969",
            fontStyle: "bold",
            stroke: "#28143f",
            strokeThickness: 4,
            rtl: true
        }).setOrigin(0.5);

        this.messageText = scene.add.text(0, -25,
            "האם לצאת אל התפריט הראשי?\nההתקדמות במשחק הנוכחי לא תישמר.", {
                fontFamily: "Arial",
                fontSize: "25px",
                color: "#282139",
                align: "center",
                lineSpacing: 8,
                rtl: true,
                wordWrap: { width: 470, useAdvancedWrap: true }
            }
        ).setOrigin(0.5);

        this.confirmButton = this.createActionButton(-130, 95, "כן, צא", 0xb63f38, () => {
            this.close(() => this.confirmCallback?.());
        });

        this.cancelButton = this.createActionButton(130, 95, "המשך לשחק", 0x2f7d4a, () => {
            this.close(() => this.cancelCallback?.());
        });

        this.add([
            this.titleText,
            this.messageText,
            this.confirmButton,
            this.cancelButton
        ]);
    }

    public show(onConfirm: () => void, onCancel?: () => void): void {
        this.confirmCallback = onConfirm;
        this.cancelCallback = onCancel;
        this.open();
    }

    public destroy(fromScene?: boolean): void {
        this.confirmCallback = undefined;
        this.cancelCallback = undefined;
        super.destroy(fromScene);
    }

    private createActionButton(
        x: number,
        y: number,
        label: string,
        color: number,
        callback: () => void
    ): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);
        const shadow = this.scene.add.rectangle(5, 7, 205, 62, 0x000000, 0.28)
            .setOrigin(0.5);
        const background = this.scene.add.rectangle(0, 0, 205, 62, color)
            .setStrokeStyle(3, 0xf3c969)
            .setInteractive({ useHandCursor: true });
        const text = this.scene.add.text(0, 0, label, {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#26162f",
            strokeThickness: 2,
            rtl: true
        }).setOrigin(0.5);

        container.add([shadow, background, text]);

        background.on("pointerover", () => {
            this.scene.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 90 });
        });
        background.on("pointerout", () => {
            this.scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 90 });
        });
        background.on("pointerdown", callback);

        return container;
    }
}

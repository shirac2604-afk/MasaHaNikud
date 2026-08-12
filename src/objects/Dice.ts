import Phaser from "phaser";
import { preferencesService } from "../services/PreferencesService";

/** קובייה עגולה ונקייה: אנימציה מוגבלת בזמן וללא tween אינסופי. */
export class Dice {
    private readonly container: Phaser.GameObjects.Container;
    private readonly shadow: Phaser.GameObjects.Arc;
    private readonly background: Phaser.GameObjects.Arc;
    private readonly label: Phaser.GameObjects.Text;
    private readonly pips: Phaser.GameObjects.Arc[] = [];
    private enabled = true;
    private rolling = false;

    constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
        this.shadow = scene.add.circle(5, 8, 55, 0x000000, 0.28);
        this.background = scene.add.circle(0, 0, 52, 0xfffdf5, 1)
            .setInteractive({ useHandCursor: true });

        this.label = scene.add.text(0, 75, "לחצו לזריקה", {
            fontFamily: "Arial", fontSize: "17px", color: "#ffffff",
            fontStyle: "bold", align: "center", rtl: true
        }).setOrigin(0.5);

        const positions = [
            [-26, -26], [0, -26], [26, -26],
            [-26, 0], [0, 0], [26, 0],
            [-26, 26], [0, 26], [26, 26]
        ];
        positions.forEach(([pipX, pipY]) => {
            this.pips.push(scene.add.circle(pipX, pipY, 7, 0x173f5f, 1).setVisible(false));
        });

        this.container = scene.add.container(x, y, [this.shadow, this.background, ...this.pips, this.label])
            .setDepth(1300);

        this.background.on("pointerover", () => {
            if (!this.enabled || this.rolling) return;
            this.scene.tweens.killTweensOf(this.container);
            this.scene.tweens.add({ targets: this.container, scale: 1.05, duration: 110, ease: "Sine.Out" });
        });
        this.background.on("pointerout", () => {
            if (this.rolling) return;
            this.scene.tweens.killTweensOf(this.container);
            this.scene.tweens.add({ targets: this.container, scale: 1, duration: 110, ease: "Sine.Out" });
        });
        this.setValue(1);
    }

    public setValue(value: number): void {
        const visibleByValue: Record<number, number[]> = {
            1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8],
            5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
        };
        const visible = new Set(visibleByValue[value] ?? visibleByValue[1]);
        this.pips.forEach((pip, index) => pip.setVisible(visible.has(index)));
    }

    public setRolling(rolling: boolean): void {
        this.rolling = rolling;
        this.scene.tweens.killTweensOf(this.container);
        this.container.setAngle(0).setScale(1);
        if (rolling) {
            this.label.setText("מתגלגלת…");
            const reducedMotion = preferencesService.isReducedMotion();
            this.scene.tweens.add({
                targets: this.container,
                angle: reducedMotion ? 90 : 720,
                scale: reducedMotion ? 1.03 : 1.1,
                duration: reducedMotion ? 220 : 700,
                ease: "Cubic.Out"
            });
            return;
        }
        this.container.setAngle(0).setScale(1);
        this.label.setText("התוצאה התקבלה");
        this.scene.tweens.add({
            targets: this.container, scale: 1.08,
            duration: preferencesService.isReducedMotion() ? 45 : 90,
            yoyo: true, ease: "Sine.Out"
        });
    }

    public setEnabled(enabled: boolean, disabledLabel = "ממתינים לסיום התור"): void {
        this.enabled = enabled;
        this.scene.tweens.killTweensOf(this.container);
        this.container.setAngle(0).setScale(1);
        if (enabled) {
            this.background.setInteractive({ useHandCursor: true });
            this.background.setFillStyle(0xfffdf5);
            this.container.setAlpha(1);
            this.label.setText("לחצו לזריקה");
        } else {
            this.background.disableInteractive();
            this.background.setFillStyle(0xe3e7ec);
            this.container.setAlpha(0.82);
            if (!this.rolling) this.label.setText(disabledLabel);
        }
    }

    public getButton(): Phaser.GameObjects.Arc { return this.background; }

    public destroy(): void {
        this.scene.tweens.killTweensOf(this.container);
        this.background.removeAllListeners();
        this.container.destroy(true);
    }
}

import Phaser from "phaser";
import { Colors } from "../theme/Colors";
import { Theme } from "../theme/Theme";

export type MenuActionStyle = "primary" | "secondary" | "neutral" | "danger";

export interface MenuActionButtonOptions {
    x: number;
    y: number;
    width?: number;
    label: string;
    hint?: string;
    glyph: string;
    style?: MenuActionStyle;
    onPress: () => void;
}

/** Large, touch-friendly main-menu action with a reusable branded style. */
export class MenuActionButton extends Phaser.GameObjects.Container {
    private readonly plate: Phaser.GameObjects.Graphics;
    private readonly hitAreaObject: Phaser.GameObjects.Rectangle;
    private readonly widthValue: number;
    private readonly baseColor: number;
    private readonly hoverColor: number;

    constructor(scene: Phaser.Scene, options: MenuActionButtonOptions) {
        super(scene, options.x, options.y);
        scene.add.existing(this);

        this.widthValue = options.width ?? 390;
        const palette = {
            primary: [Colors.primary, Colors.primaryHover],
            secondary: [Colors.secondary, Colors.secondaryHover],
            neutral: [0x274665, 0x345a7d],
            danger: [0x8f3540, 0xb4424d]
        } as const;
        [this.baseColor, this.hoverColor] = palette[options.style ?? "primary"];

        const shadow = scene.add.graphics();
        shadow.fillStyle(0x000000, 0.30);
        shadow.fillRoundedRect(-this.widthValue / 2 + 5, -31, this.widthValue, 70, Theme.radius.medium);

        this.plate = scene.add.graphics();
        this.paint(this.baseColor);

        const iconPlate = scene.add.circle(this.widthValue / 2 - 42, 0, 23, 0xffffff, 0.15)
            .setStrokeStyle(2, Colors.gold, 0.78);
        const glyph = scene.add.text(this.widthValue / 2 - 42, -1, options.glyph, {
            fontFamily: Theme.fonts.family,
            fontSize: "21px",
            fontStyle: "bold",
            color: "#FFF3C5",
            rtl: true
        }).setOrigin(0.5);

        const label = scene.add.text(22, options.hint ? -10 : 0, options.label, {
            ...Theme.fonts.button,
            stroke: "#161125",
            strokeThickness: 2,
            rtl: true
        }).setOrigin(0.5);

        const children: Phaser.GameObjects.GameObject[] = [shadow, this.plate, iconPlate, glyph, label];
        if (options.hint) {
            children.push(scene.add.text(22, 18, options.hint, {
                fontFamily: Theme.fonts.family,
                fontSize: "14px",
                color: "#DDEBFA",
                rtl: true
            }).setOrigin(0.5));
        }

        this.hitAreaObject = scene.add.rectangle(0, 0, this.widthValue, 70, 0xffffff, 0.001)
            .setInteractive({ useHandCursor: true });
        children.push(this.hitAreaObject);
        this.add(children);
        this.setSize(this.widthValue, 70);

        this.hitAreaObject.on("pointerover", () => this.setVisualState(true));
        this.hitAreaObject.on("pointerout", () => this.setVisualState(false));
        this.hitAreaObject.on("pointerdown", () => {
            scene.tweens.add({
                targets: this,
                scaleX: 0.965,
                scaleY: 0.965,
                duration: Theme.motion.fast,
                yoyo: true,
                onComplete: options.onPress
            });
        });
    }

    setEnabled(enabled: boolean): this {
        this.hitAreaObject.disableInteractive();
        if (enabled) this.hitAreaObject.setInteractive({ useHandCursor: true });
        this.setAlpha(enabled ? 1 : 0.48);
        return this;
    }

    private setVisualState(hovered: boolean): void {
        this.paint(hovered ? this.hoverColor : this.baseColor);
        this.scene.tweens.add({
            targets: this,
            scaleX: hovered ? 1.025 : 1,
            scaleY: hovered ? 1.025 : 1,
            duration: Theme.motion.fast
        });
    }

    private paint(color: number): void {
        this.plate.clear();
        this.plate.fillStyle(color, 0.97);
        this.plate.fillRoundedRect(-this.widthValue / 2, -35, this.widthValue, 70, Theme.radius.medium);
        this.plate.lineStyle(3, Colors.gold, 0.95);
        this.plate.strokeRoundedRect(-this.widthValue / 2, -35, this.widthValue, 70, Theme.radius.medium);
        this.plate.lineStyle(1, 0xffffff, 0.18);
        this.plate.strokeRoundedRect(-this.widthValue / 2 + 4, -31, this.widthValue - 8, 62, Theme.radius.medium - 3);
    }
}

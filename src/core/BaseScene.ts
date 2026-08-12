import Phaser from "phaser";
import { AssetKeys } from "./AssetKeys";
import { GameConfig } from "./GameConfig";
import { Colors } from "../theme/Colors";
import { BrandBadge } from "../ui/BrandBadge";

export abstract class BaseScene extends Phaser.Scene {
    constructor(key: string) {
        super(key);
    }

    protected setBackground(assetKey: string = AssetKeys.Boards.HOLAM): void {
        const width = GameConfig.WIDTH;
        const height = GameConfig.HEIGHT;

        if (this.textures.exists(assetKey)) {
            const image = this.add.image(width / 2, height / 2, assetKey).setDepth(-20);
            const source = this.textures.get(assetKey).getSourceImage() as HTMLImageElement;
            const scale = Math.max(width / source.width, height / source.height);
            image.setScale(scale).setAlpha(0.26);
        }

        this.add.rectangle(width / 2, height / 2, width, height, Colors.background, 0.48).setDepth(-19);

        const vignette = this.add.graphics().setDepth(-18);
        vignette.fillStyle(0x071629, 0.28);
        vignette.fillRect(0, 0, width, 70);
        vignette.fillRect(0, height - 58, width, 58);
        vignette.lineStyle(3, Colors.border, 0.88);
        vignette.strokeRoundedRect(10, 10, width - 20, height - 20, 26);
    }

    /** Clean circular brand mark for all non-game screens. */
    protected createBrandMark(): Phaser.GameObjects.Container {
        return new BrandBadge(this, {
            x: 1185,
            y: 82,
            diameter: 138,
            depth: 120,
            frameless: true
        });
    }

    protected createHeader(title: string, subtitle?: string): Phaser.GameObjects.Container {
        const container = this.add.container(GameConfig.WIDTH / 2, 60).setDepth(20);
        const width = 620;
        const height = subtitle ? 92 : 68;

        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.28);
        shadow.fillRoundedRect(-width / 2 + 5, -height / 2 + 7, width, height, 22);

        const banner = this.add.graphics();
        banner.fillStyle(Colors.primary, 0.98);
        banner.fillRoundedRect(-width / 2, -height / 2, width, height, 22);
        banner.lineStyle(4, Colors.gold, 1);
        banner.strokeRoundedRect(-width / 2, -height / 2, width, height, 22);

        const titleText = this.add.text(0, subtitle ? -15 : 0, title, {
            fontFamily: "Arial",
            fontSize: subtitle ? "34px" : "38px",
            fontStyle: "bold",
            color: Colors.cream,
            stroke: "#34145f",
            strokeThickness: 4,
            align: "center",
            rtl: true
        }).setOrigin(0.5);

        container.add([shadow, banner, titleText]);

        if (subtitle) {
            container.add(this.add.text(0, 23, subtitle, {
                fontFamily: "Arial",
                fontSize: "17px",
                color: "#fff7df",
                align: "center",
                rtl: true
            }).setOrigin(0.5));
        }

        return container;
    }

    protected createTitle(text: string): Phaser.GameObjects.Text {
        this.createHeader(text);
        return this.add.text(-1000, -1000, text).setVisible(false);
    }

    protected createSubtitle(text: string): Phaser.GameObjects.Text {
        return this.add.text(GameConfig.WIDTH / 2, 118, text, {
            fontFamily: "Arial",
            fontSize: "21px",
            color: Colors.cream,
            stroke: "#000000",
            strokeThickness: 3,
            rtl: true
        }).setOrigin(0.5).setDepth(20);
    }

    protected createButton(
        x: number,
        y: number,
        text: string,
        callback: () => void,
        width = 300,
        style: "primary" | "secondary" | "danger" | "gold" = "primary"
    ): Phaser.GameObjects.Container {
        const palette = {
            primary: [Colors.primary, Colors.primaryHover],
            secondary: [Colors.secondary, Colors.secondaryHover],
            danger: [Colors.red, 0xd14c43],
            gold: [0xd99014, 0xf0aa25]
        } as const;
        const [base, hover] = palette[style];

        const container = this.add.container(x, y).setDepth(30);
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.3);
        shadow.fillRoundedRect(-width / 2 + 5, -28, width, 66, 16);

        const background = this.add.graphics();
        background.fillStyle(base, 1);
        background.fillRoundedRect(-width / 2, -34, width, 66, 16);
        background.lineStyle(3, Colors.gold, 1);
        background.strokeRoundedRect(-width / 2, -34, width, 66, 16);

        const hit = this.add.rectangle(0, 0, width, 68, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
        const label = this.add.text(0, -2, text, {
            fontFamily: "Arial",
            fontSize: "28px",
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#1a1028",
            strokeThickness: 3,
            rtl: true
        }).setOrigin(0.5);

        container.add([shadow, background, hit, label]);

        const repaint = (color: number): void => {
            background.clear();
            background.fillStyle(color, 1);
            background.fillRoundedRect(-width / 2, -34, width, 66, 16);
            background.lineStyle(3, Colors.gold, 1);
            background.strokeRoundedRect(-width / 2, -34, width, 66, 16);
        };

        hit.on("pointerover", () => {
            repaint(hover);
            this.tweens.add({ targets: container, scaleX: 1.035, scaleY: 1.035, duration: 110 });
        });
        hit.on("pointerout", () => {
            repaint(base);
            this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 110 });
        });
        hit.on("pointerdown", () => {
            this.tweens.add({
                targets: container,
                scaleX: 0.96,
                scaleY: 0.96,
                duration: 70,
                yoyo: true,
                onComplete: callback
            });
        });

        return container;
    }

    protected createGlassPanel(x: number, y: number, width: number, height: number): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.25);
        shadow.fillRoundedRect(-width / 2 + 7, -height / 2 + 8, width, height, 22);
        const panel = this.add.graphics();
        panel.fillStyle(0xf7fbff, 0.9);
        panel.fillRoundedRect(-width / 2, -height / 2, width, height, 22);
        panel.lineStyle(3, Colors.border, 0.95);
        panel.strokeRoundedRect(-width / 2, -height / 2, width, height, 22);
        container.add([shadow, panel]);
        return container;
    }

    protected showMessage(text: string, color = "#ffffff"): Phaser.GameObjects.Text {
        const message = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 46, text, {
            fontFamily: "Arial",
            fontSize: "26px",
            color,
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 5,
            rtl: true
        }).setOrigin(0.5).setDepth(100);
        this.time.delayedCall(2500, () => message.destroy());
        return message;
    }
}

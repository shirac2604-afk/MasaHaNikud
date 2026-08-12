import { BaseScene } from "../core/BaseScene";
import { SceneKeys } from "../core/SceneKeys";
import { AssetKeys } from "../core/AssetKeys";
import { gameState } from "../services/GameState";
import { Colors } from "../theme/Colors";

export class PlayerSetupScene extends BaseScene {
    constructor() {
        super(SceneKeys.PLAYER_SETUP);
    }

    create(): void {
        this.setBackground(AssetKeys.Boards.SHURUK);
        this.createBrandMark();
        this.createHeader("בחירת שחקנים", "כמה משתתפים יצאו למסע?");
        this.createGlassPanel(640, 400, 850, 390).setDepth(5);

        const playerCounts = [1, 2, 3, 4];
        const cardSpacing = 195;
        const totalWidth = (playerCounts.length - 1) * cardSpacing;
        const startX = 640 - totalWidth / 2;

        playerCounts.forEach((count, index) => {
            const x = startX + index * cardSpacing;
            const card = this.add.container(x, 390).setDepth(10);

            const shadow = this.add.graphics();
            shadow.fillStyle(0x000000, 0.35);
            shadow.fillRoundedRect(-75, -115, 150, 245, 20);

            const panel = this.add.graphics();
            panel.fillStyle(0x152a46, 0.98);
            panel.fillRoundedRect(-75, -122, 150, 245, 20);
            panel.lineStyle(3, Colors.border, 1);
            panel.strokeRoundedRect(-75, -122, 150, 245, 20);

            const number = this.add.text(0, -54, String(count), {
                fontFamily: "Arial",
                fontSize: "64px",
                fontStyle: "bold",
                color: "#ffd86a",
                stroke: "#5d2d08",
                strokeThickness: 4
            }).setOrigin(0.5);

            const label = this.add.text(0, 23, count === 1 ? "שחקן" : "שחקנים", {
                fontFamily: "Arial",
                fontSize: "21px",
                color: "#ffffff",
                rtl: true
            }).setOrigin(0.5);

            const icons = this.add.text(0, 75, "● ".repeat(count).trim(), {
                fontFamily: "Arial",
                fontSize: "19px",
                color: "#72c7ff"
            }).setOrigin(0.5);

            const hit = this.add.rectangle(
                0,
                0,
                150,
                245,
                0xffffff,
                0.001
            ).setInteractive({ useHandCursor: true });

            card.add([
                shadow,
                panel,
                number,
                label,
                icons,
                hit
            ]);

            hit.on("pointerover", () => {
                this.tweens.add({
                    targets: card,
                    y: 375,
                    scale: 1.06,
                    duration: 130
                });
            });

            hit.on("pointerout", () => {
                this.tweens.add({
                    targets: card,
                    y: 390,
                    scale: 1,
                    duration: 130
                });
            });

            hit.on("pointerdown", () => {
                gameState.setPlayerCount(count);
                gameState.createPlayers();

                this.scene.start(SceneKeys.CHARACTER_SELECT);
            });
        });

        this.createButton(
            130,
            665,
            "חזרה",
            () => this.scene.start(SceneKeys.MENU),
            220,
            "secondary"
        );
    }
}

import Phaser from "phaser";
import { Character } from "../models/Character";
import { Colors } from "../theme/Colors";

/** A polished, reusable character selection card. */
export class CharacterCard {
    private readonly container: Phaser.GameObjects.Container;

    constructor(
        scene: Phaser.Scene,
        character: Character,
        x: number,
        y: number,
        onClick: (id: number) => void
    ) {
        const selected = Boolean(character.selected);
        const width = 176;
        const height = 314;

        this.container = scene.add.container(x, y).setDepth(10);

        const shadow = scene.add.graphics();
        shadow.fillStyle(0x061325, 0.34);
        shadow.fillRoundedRect(-width / 2 + 7, -height / 2 + 11, width, height, 24);

        const background = scene.add.graphics();
        const paintBackground = (hovered = false): void => {
            background.clear();
            background.fillStyle(selected ? 0xd7dde5 : hovered ? 0xfffbeb : 0xf9fcff, 1);
            background.fillRoundedRect(-width / 2, -height / 2, width, height, 24);
            background.lineStyle(
                selected ? 3 : hovered ? 5 : 4,
                selected ? 0x89939f : hovered ? 0xffbf2f : Colors.gold,
                1
            );
            background.strokeRoundedRect(-width / 2, -height / 2, width, height, 24);
        };
        paintBackground();

        const topBand = scene.add.graphics();
        topBand.fillStyle(selected ? 0xaab2bc : 0x163f68, 1);
        topBand.fillRoundedRect(-width / 2 + 5, -height / 2 + 5, width - 10, 52, 19);

        const playerLabel = scene.add.text(0, -131, `דמות ${character.id}`, {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#ffffff",
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0.5);

        const portraitFrame = scene.add.graphics();
        portraitFrame.fillStyle(selected ? 0xc5cbd2 : 0xe7f7ff, 1);
        portraitFrame.fillCircle(0, -40, 75);
        portraitFrame.lineStyle(3, selected ? 0x9aa3ad : 0x70cce8, 0.95);
        portraitFrame.strokeCircle(0, -40, 75);

        const image = scene.add.image(0, -35, character.texture)
            .setDisplaySize(148, 148)
            .setAlpha(selected ? 0.42 : 1);

        const name = scene.add.text(0, 61, character.name, {
            fontFamily: "Arial",
            fontSize: "21px",
            color: selected ? "#6d7680" : "#102b55",
            fontStyle: "bold",
            align: "center",
            rtl: true
        }).setOrigin(0.5);

        const button = scene.add.graphics();
        button.fillStyle(selected ? 0xaab2bc : 0x5c2b91, 1);
        button.fillRoundedRect(-64, 96, 128, 42, 15);
        button.lineStyle(2, selected ? 0x8f98a2 : 0xf1d179, 1);
        button.strokeRoundedRect(-64, 96, 128, 42, 15);

        const status = scene.add.text(0, 117, selected ? "✓ נבחר" : "בחרו", {
            fontFamily: "Arial",
            fontSize: "18px",
            color: "#ffffff",
            rtl: true,
            fontStyle: "bold"
        }).setOrigin(0.5);

        const hit = scene.add.rectangle(0, 0, width, height, 0xffffff, 0.001);
        this.container.add([
            shadow,
            background,
            topBand,
            playerLabel,
            portraitFrame,
            image,
            name,
            button,
            status,
            hit
        ]);

        if (selected) {
            return;
        }

        hit.setInteractive({ useHandCursor: true });
        hit.on("pointerover", () => {
            paintBackground(true);
            scene.tweens.killTweensOf(this.container);
            scene.tweens.add({
                targets: this.container,
                y: y - 10,
                scale: 1.045,
                duration: 130,
                ease: "Sine.Out"
            });
        });
        hit.on("pointerout", () => {
            paintBackground(false);
            scene.tweens.killTweensOf(this.container);
            scene.tweens.add({ targets: this.container, y, scale: 1, duration: 130 });
        });
        hit.on("pointerdown", () => {
            scene.tweens.killTweensOf(this.container);
            scene.tweens.add({
                targets: this.container,
                scale: 0.96,
                duration: 70,
                yoyo: true,
                onComplete: () => onClick(character.id)
            });
        });
    }
}

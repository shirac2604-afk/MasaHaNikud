import Phaser from "phaser";
import { BoardPack } from "../models/BoardPack";
import { Colors } from "../theme/Colors";
import { getBoardPreviewKey } from "../loaders/BoardLoader";

export interface BoardCardOptions {
    x: number;
    y: number;
    width?: number;
    height?: number;
    selected?: boolean;
    onSelect: (boardId: string) => void;
    onActivate?: (boardId: string) => void;
}

/**
 * Large illustrated card used by the six-board library.
 * The preview artwork already contains the real arithmetic exercises from the
 * board pack, so the child sees the actual learning content before playing.
 */
export class BoardCard {
    private readonly container: Phaser.GameObjects.Container;
    private readonly background: Phaser.GameObjects.Graphics;
    private readonly selectedMark: Phaser.GameObjects.Graphics;
    private readonly width: number;
    private readonly height: number;
    private selected = false;

    constructor(scene: Phaser.Scene, board: BoardPack, options: BoardCardOptions) {
        this.width = options.width ?? 388;
        this.height = options.height ?? 232;
        const { x, y } = options;

        this.container = scene.add.container(x, y).setDepth(10);

        const shadow = scene.add.graphics();
        shadow.fillStyle(0x000000, 0.30);
        shadow.fillRoundedRect(-this.width / 2 + 7, -this.height / 2 + 9, this.width, this.height, 18);

        this.background = scene.add.graphics();
        this.selectedMark = scene.add.graphics();

        const previewKey = getBoardPreviewKey(board.id);
        const image = scene.add.image(0, 0, previewKey);
        if (scene.textures.exists(previewKey)) {
            const source = scene.textures.get(previewKey).getSourceImage() as HTMLImageElement;
            const sourceWidth = Number(source?.width) || 800;
            const sourceHeight = Number(source?.height) || 500;
            image.setDisplaySize(this.width - 12, this.height - 12);
            image.setCrop(0, 0, sourceWidth, sourceHeight);
        } else {
            image.setVisible(false);
            const fallback = scene.add.text(0, 0, board.name, {
                fontFamily: "Arial", fontSize: "24px", color: "#ffffff", fontStyle: "bold",
                rtl: true, align: "center", wordWrap: { width: this.width - 42 }
            }).setOrigin(0.5);
            this.container.add(fallback);
            console.error(`[BOARD ASSET] Missing card preview texture: ${previewKey}`);
        }

        const hit = scene.add.rectangle(0, 0, this.width, this.height, 0xffffff, 0.001)
            .setInteractive({ useHandCursor: true });

        this.container.add([shadow, this.background, image, this.selectedMark, hit]);

        hit.on("pointerover", () => {
            this.repaint(true);
            scene.tweens.add({ targets: this.container, y: y - 4, scale: 1.018, duration: 110 });
        });
        hit.on("pointerout", () => {
            this.repaint(false);
            scene.tweens.add({ targets: this.container, y, scale: 1, duration: 110 });
        });
        hit.on("pointerdown", () => {
            scene.tweens.add({
                targets: this.container, scale: 0.975, duration: 60, yoyo: true,
                onComplete: () => options.onSelect(board.id)
            });
        });
        hit.on("pointerup", () => {
            // A second click on the selected card launches it, matching a standard game library.
            if (this.selected && options.onActivate) options.onActivate(board.id);
        });

        this.setSelected(options.selected ?? false);
    }

    public setSelected(selected: boolean): void {
        this.selected = selected;
        this.repaint(false);
        this.selectedMark.clear();
        if (selected) {
            this.selectedMark.fillStyle(Colors.gold, 1);
            this.selectedMark.fillCircle(this.width / 2 - 24, -this.height / 2 + 24, 16);
            this.selectedMark.lineStyle(3, 0xffffff, 1);
            this.selectedMark.strokeCircle(this.width / 2 - 24, -this.height / 2 + 24, 16);
            this.selectedMark.lineStyle(4, 0x18335f, 1);
            this.selectedMark.beginPath();
            this.selectedMark.moveTo(this.width / 2 - 31, -this.height / 2 + 24);
            this.selectedMark.lineTo(this.width / 2 - 26, -this.height / 2 + 29);
            this.selectedMark.lineTo(this.width / 2 - 17, -this.height / 2 + 17);
            this.selectedMark.strokePath();
        }
    }

    private repaint(hovered: boolean): void {
        this.background.clear();
        this.background.fillStyle(0xffffff, 0.98);
        this.background.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 18);
        this.background.lineStyle(
            this.selected ? 6 : 3,
            this.selected ? Colors.gold : (hovered ? 0x62c6ff : 0xd9edff),
            1
        );
        this.background.strokeRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 18);
    }
}

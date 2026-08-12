import Phaser from "phaser";
import { boardPackRegistry } from "../data/boardPacks/BoardPackRegistry";
import { gameState } from "../services/GameState";
import { BoardService, BoardBounds } from "../services/BoardService";
import { preferencesService } from "../services/PreferencesService";
import { Theme } from "../theme/Theme";
import { BoardPathLayer } from "../objects/BoardPathLayer";
import { getBoardPreviewKey } from "../loaders/BoardLoader";


/**
 * Creates the visual presentation of the selected board and exposes its
 * logical tile coordinates. The chrome is deliberately separate from the
 * board artwork so future boards automatically inherit the same polish.
 */
export class BoardManager {
    private boardService!: BoardService;
    private boardImage?: Phaser.GameObjects.Image;
    private boardFallback?: Phaser.GameObjects.Graphics;
    private shadow?: Phaser.GameObjects.Graphics;
    private frame?: Phaser.GameObjects.Graphics;
    private header?: Phaser.GameObjects.Container;
    private startBadge?: Phaser.GameObjects.Container;
    private finishBadge?: Phaser.GameObjects.Container;
    private focusRing?: Phaser.GameObjects.Arc;
    private focusTween?: Phaser.Tweens.Tween;
    private pathLayer?: BoardPathLayer;

    constructor(private readonly scene: Phaser.Scene) {}

    public create(): void {
        const board = boardPackRegistry.getById(gameState.getBoard()) ?? boardPackRegistry.getDefault();
        const maxWidth = 1032;
        const maxHeight = 568;
        const previewKey = getBoardPreviewKey(board.id);
        const runtimeTextureExists = this.scene.textures.exists(board.assetKey);
        const previewTextureExists = this.scene.textures.exists(previewKey);
        const boardTextureKey = runtimeTextureExists
            ? board.assetKey
            : previewTextureExists
                ? previewKey
                : undefined;
        const source = boardTextureKey
            ? this.scene.textures.get(boardTextureKey).getSourceImage() as HTMLImageElement
            : undefined;
        const sourceWidth = Number(source?.width) || board.layout.referenceWidth || 1600;
        const sourceHeight = Number(source?.height) || board.layout.referenceHeight || 1000;
        const ratio = sourceWidth / sourceHeight;
        const width = ratio > maxWidth / maxHeight ? maxWidth : maxHeight * ratio;
        const height = ratio > maxWidth / maxHeight ? maxWidth / ratio : maxHeight;
        const centerX = 586;
        const centerY = 414;

        this.createShadow(centerX, centerY, width, height);
        this.createFrame(centerX, centerY, width, height);

        if (boardTextureKey) {
            this.boardImage = this.scene.add.image(centerX, centerY, boardTextureKey)
                .setDisplaySize(width, height)
                .setAlpha(1)
                .setVisible(true)
                .setDepth(2);
        } else {
            this.boardFallback = this.scene.add.graphics().setDepth(2);
            this.boardFallback.fillStyle(Number.parseInt(board.theme.primary.replace("#", ""), 16) || 0x17335d, 1);
            this.boardFallback.fillRoundedRect(centerX - width / 2, centerY - height / 2, width, height, 20);
            console.error(`[BOARD ASSET] Runtime and preview textures are missing for ${board.id}: ${board.assetKey}`);
        }

        const bounds: BoardBounds = {
            x: centerX - width / 2,
            y: centerY - height / 2,
            width,
            height
        };

        this.boardService = new BoardService(board, bounds);
        this.pathLayer = new BoardPathLayer(this.scene, this.boardService, board, bounds);
        if (board.layout.renderHeader !== false) this.createHeader(board.name, board.description, centerX, bounds.y);
        if (board.layout.renderEndpointBadges !== false) this.createEndpointBadges();
        this.createFocusRing();
        this.focusTile(1);
    }

    private createShadow(centerX: number, centerY: number, width: number, height: number): void {
        this.shadow = this.scene.add.graphics().setDepth(0);
        this.shadow.fillStyle(0x000000, 0.42);
        this.shadow.fillRoundedRect(
            centerX - width / 2 - 19,
            centerY - height / 2 - 5,
            width + 38,
            height + 38,
            Theme.radius.large
        );
    }

    private createFrame(centerX: number, centerY: number, width: number, height: number): void {
        this.frame = this.scene.add.graphics().setDepth(1);
        const x = centerX - width / 2 - 12;
        const y = centerY - height / 2 - 12;

        this.frame.fillStyle(0xf9e8bd, 1);
        this.frame.fillRoundedRect(x, y, width + 24, height + 24, 22);
        this.frame.lineStyle(5, Theme.colors.goldDark, 1);
        this.frame.strokeRoundedRect(x, y, width + 24, height + 24, 22);
        this.frame.lineStyle(2, Theme.colors.gold, 0.9);
        this.frame.strokeRoundedRect(x + 7, y + 7, width + 10, height + 10, 16);

        // Small corner ornaments make the frame feel intentional without
        // covering artwork or relying on board-specific assets.
        const corners = [
            [x + 22, y + 22],
            [x + width + 2, y + 22],
            [x + 22, y + height + 2],
            [x + width + 2, y + height + 2]
        ];
        corners.forEach(([cx, cy]) => {
            this.frame?.fillStyle(Theme.colors.goldDark, 1);
            this.frame?.fillCircle(cx, cy, 7);
            this.frame?.fillStyle(Theme.colors.gold, 1);
            this.frame?.fillCircle(cx, cy, 3);
        });
    }

    private createHeader(name: string, description: string, centerX: number, boardTop: number): void {
        const panel = this.scene.add.graphics();
        panel.fillStyle(Theme.colors.panel, 0.96);
        panel.fillRoundedRect(-244, -31, 488, 62, Theme.radius.medium);
        panel.lineStyle(2, Theme.colors.border, 1);
        panel.strokeRoundedRect(-244, -31, 488, 62, Theme.radius.medium);

        const title = this.scene.add.text(0, -10, name, {
            fontFamily: Theme.fonts.family,
            fontSize: "24px",
            fontStyle: "bold",
            color: Theme.colors.white,
            rtl: true,
            align: "center"
        }).setOrigin(0.5);

        const subtitle = this.scene.add.text(0, 16, description, {
            fontFamily: Theme.fonts.family,
            fontSize: "14px",
            color: Theme.colors.cream,
            rtl: true,
            align: "center"
        }).setOrigin(0.5);

        this.header = this.scene.add.container(centerX, Math.max(139, boardTop - 34), [panel, title, subtitle])
            .setDepth(8);
    }

    private createEndpointBadges(): void {
        const start = this.boardService.getStartTile();
        const finish = this.boardService.getTile(this.boardService.getTileCount());
        if (!start || !finish) return;

        this.startBadge = this.createBadge(start.centerX, start.centerY - 48, "התחלה", 0x2f8f4e);
        this.finishBadge = this.createBadge(finish.centerX, finish.centerY - 48, "סיום", 0xb83d35);
    }

    private createBadge(x: number, y: number, label: string, color: number): Phaser.GameObjects.Container {
        const plate = this.scene.add.graphics();
        plate.fillStyle(color, 0.96);
        plate.fillRoundedRect(-35, -13, 70, 26, Theme.radius.small);
        plate.lineStyle(2, 0xffffff, 0.9);
        plate.strokeRoundedRect(-35, -13, 70, 26, Theme.radius.small);

        const text = this.scene.add.text(0, 0, label, {
            fontFamily: Theme.fonts.family,
            fontSize: "14px",
            fontStyle: "bold",
            color: "#ffffff",
            rtl: true
        }).setOrigin(0.5);

        return this.scene.add.container(x, y, [plate, text]).setDepth(7);
    }

    private createFocusRing(): void {
        this.focusRing = this.scene.add.circle(0, 0, 31, Theme.colors.gold, 0.12)
            .setStrokeStyle(4, Theme.colors.gold, 0.96)
            .setDepth(70)
            .setVisible(false);

        if (!preferencesService.isReducedMotion()) {
            this.focusTween = this.scene.tweens.add({
                targets: this.focusRing,
                scale: 1.18,
                alpha: 0.48,
                duration: 620,
                yoyo: true,
                repeat: -1
            });
        }
    }

    public focusTile(tileId: number): void {
        const tile = this.boardService?.getTile(tileId);
        if (!tile || !this.focusRing) return;

        this.focusRing.setPosition(tile.centerX, tile.centerY).setVisible(true).setAlpha(1);
        if (preferencesService.isReducedMotion()) {
            this.focusRing.setScale(1);
        }
    }

    public getBoardService(): BoardService {
        return this.boardService;
    }

    public destroy(): void {
        this.focusTween?.stop();
        if (this.focusRing) this.scene.tweens.killTweensOf(this.focusRing);
        this.focusRing?.destroy();
        this.startBadge?.destroy(true);
        this.finishBadge?.destroy(true);
        this.header?.destroy(true);
        this.pathLayer?.destroy();
        this.boardImage?.destroy();
        this.boardFallback?.destroy();
        this.frame?.destroy();
        this.shadow?.destroy();

        this.focusTween = undefined;
        this.focusRing = undefined;
        this.startBadge = undefined;
        this.finishBadge = undefined;
        this.header = undefined;
        this.pathLayer = undefined;
        this.boardImage = undefined;
        this.boardFallback = undefined;
        this.frame = undefined;
        this.shadow = undefined;
    }
}

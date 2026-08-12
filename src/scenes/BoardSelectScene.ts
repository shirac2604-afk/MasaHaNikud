import Phaser from "phaser";
import { BaseScene } from "../core/BaseScene";
import { SceneKeys } from "../core/SceneKeys";
import { AssetKeys } from "../core/AssetKeys";
import { boardPackRegistry } from "../data/boardPacks/BoardPackRegistry";
import { gameState } from "../services/GameState";
import { BoardCard } from "../ui/BoardCard";
import { BoardPack } from "../models/BoardPack";

export class BoardSelectScene extends BaseScene {
    private selectedBoard!: BoardPack;
    private cards = new Map<string, BoardCard>();
    private selectedLabel?: Phaser.GameObjects.Text;

    constructor() { super(SceneKeys.BOARD_SELECT); }

    create(): void {
        const boards = boardPackRegistry.getAll();
        const previous = boardPackRegistry.getById(gameState.getBoard());
        this.selectedBoard = previous ?? boardPackRegistry.getDefault();

        this.createLibraryBackground();
        this.createBrandHeader();

        const positions = [
            { x: 215, y: 270 }, { x: 640, y: 270 }, { x: 1065, y: 270 },
            { x: 215, y: 520 }, { x: 640, y: 520 }, { x: 1065, y: 520 }
        ];

        boards.forEach((board, index) => {
            const position = positions[index];
            const card = new BoardCard(this, board, {
                ...position,
                width: 398,
                height: 226,
                selected: board.id === this.selectedBoard.id,
                onSelect: id => this.selectBoard(id),
                onActivate: id => {
                    this.selectBoard(id);
                    this.startSelectedBoard();
                }
            });
            this.cards.set(board.id, card);
        });

        this.createFooter();

        this.input.keyboard?.on("keydown-LEFT", () => this.moveSelection(1));
        this.input.keyboard?.on("keydown-RIGHT", () => this.moveSelection(-1));
        this.input.keyboard?.on("keydown-UP", () => this.moveSelection(-3));
        this.input.keyboard?.on("keydown-DOWN", () => this.moveSelection(3));
        this.input.keyboard?.on("keydown-ENTER", () => this.startSelectedBoard());
        this.input.keyboard?.on("keydown-ESC", () => this.goBack());
    }

    private createLibraryBackground(): void {
        const bg = this.add.graphics().setDepth(0);
        bg.fillGradientStyle(0x052a63, 0x063b83, 0x0a74bd, 0x08488f, 1);
        bg.fillRect(0, 0, 1280, 720);

        const rays = this.add.graphics().setDepth(1);
        rays.fillStyle(0x38bdf8, 0.08);
        for (let i = 0; i < 11; i++) {
            const left = 640 + (i - 5.5) * 145;
            rays.fillTriangle(640, 78, left, 720, left + 72, 720);
        }
        const stars = this.add.graphics().setDepth(1);
        stars.fillStyle(0xffffff, 0.75);
        [[120,72],[310,45],[970,52],[1160,84],[530,32],[752,48]].forEach(([x,y]) => {
            stars.fillCircle(x, y, 2.4);
            stars.fillRect(x - 1, y - 8, 2, 16);
            stars.fillRect(x - 8, y - 1, 16, 2);
        });
    }

    private createBrandHeader(): void {
        const logo = this.add.image(640, 58, AssetKeys.Brand.LOGO_ORIGINAL).setDepth(5);
        const source = this.textures.get(AssetKeys.Brand.LOGO_ORIGINAL).getSourceImage() as HTMLImageElement;
        const sw = Number(source?.width) || 1200;
        const sh = Number(source?.height) || 1200;
        logo.setScale(Math.min(250 / sw, 104 / sh));

        this.add.text(640, 99, "מסע הניקוד", {
            fontFamily: "Arial", fontSize: "25px", color: "#ffffff", fontStyle: "bold",
            stroke: "#10234d", strokeThickness: 5, rtl: true
        }).setOrigin(0.5).setDepth(6);

        this.add.text(640, 131, "בחרו לוח מסע", {
            fontFamily: "Arial", fontSize: "22px", color: "#eaf6ff", fontStyle: "bold", rtl: true
        }).setOrigin(0.5).setDepth(6);

        this.createRoundNavigationButton(50, 50, "⌂", () => this.goBack());
        this.createRoundNavigationButton(1230, 50, "⚙", () => this.scene.start(SceneKeys.SETTINGS));
    }

    private createRoundNavigationButton(x: number, y: number, label: string, callback: () => void): void {
        const circle = this.add.circle(x, y, 31, 0x148dde, 1).setDepth(8)
            .setStrokeStyle(4, 0xcdeeff, 1)
            .setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y - 1, label, {
            fontFamily: "Arial", fontSize: "31px", color: "#ffffff", fontStyle: "bold"
        }).setOrigin(0.5).setDepth(9);
        circle.on("pointerover", () => this.tweens.add({ targets: [circle, text], scale: 1.08, duration: 90 }));
        circle.on("pointerout", () => this.tweens.add({ targets: [circle, text], scale: 1, duration: 90 }));
        circle.on("pointerdown", callback);
    }

    private createFooter(): void {
        const footer = this.add.graphics().setDepth(7);
        footer.fillStyle(0xfff7e5, 0.98);
        footer.fillRoundedRect(18, 645, 1244, 62, 18);
        footer.lineStyle(3, 0xf1bf56, 1);
        footer.strokeRoundedRect(18, 645, 1244, 62, 18);

        this.selectedLabel = this.add.text(640, 661, "", {
            fontFamily: "Arial", fontSize: "18px", color: "#17335d", fontStyle: "bold", rtl: true
        }).setOrigin(0.5, 0).setDepth(9);
        this.refreshSelectedLabel();

        this.createButton(1120, 676, "התחל משחק", () => this.startSelectedBoard(), 235, "gold");
        this.createButton(150, 676, "חזרה", () => this.goBack(), 180, "secondary");
    }

    private selectBoard(id: string): void {
        const board = boardPackRegistry.getById(id);
        if (!board) return;
        this.selectedBoard = board;
        this.cards.forEach((card, cardId) => card.setSelected(cardId === id));
        this.refreshSelectedLabel();
    }

    private refreshSelectedLabel(): void {
        this.selectedLabel?.setText(
            `${this.selectedBoard.name}  •  ${this.selectedBoard.path.length} תחנות  •  ${this.selectedBoard.learningGoals[0] ?? "תרגול ניקוד"}`
        );
    }

    private moveSelection(delta: number): void {
        const boards = boardPackRegistry.getAll();
        const current = boards.findIndex(board => board.id === this.selectedBoard.id);
        const next = (current + delta + boards.length) % boards.length;
        this.selectBoard(boards[next].id);
    }

    private goBack(): void {
        const hasPlayers = gameState.getPlayers().length > 0;
        this.scene.start(hasPlayers ? SceneKeys.CHARACTER_SELECT : SceneKeys.MENU);
    }

    private startSelectedBoard(): void {
        gameState.setBoard(this.selectedBoard.id);
        if (gameState.getPlayers().length === 0 || gameState.getPlayerCount() === 0) {
            this.scene.start(SceneKeys.PLAYER_SETUP);
            return;
        }
        const missingCharacter = gameState.getPlayers().some((_, index) => !gameState.getPlayerCharacter(index));
        if (missingCharacter) {
            this.scene.start(SceneKeys.CHARACTER_SELECT);
            return;
        }
        this.scene.start(SceneKeys.GAME);
    }
}

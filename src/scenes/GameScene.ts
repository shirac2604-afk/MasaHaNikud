import Phaser from "phaser";

import { BaseScene } from "../core/BaseScene";
import { SceneKeys } from "../core/SceneKeys";

import { BoardManager } from "../managers/BoardManager";
import { DiceManager } from "../managers/DiceManager";
import { MovementManager } from "../managers/MovementManager";
import { PlayerManager } from "../managers/PlayerManager";
import { UIManager } from "../managers/UIManager";
import { PopupManager } from "../managers/PopupManager";
import { GameSessionManager } from "../managers/GameSessionManager";
import { TurnPhase } from "../managers/TurnManager";
import { GameplayCoordinator } from "../managers/GameplayCoordinator";
import { ResourceCleanupManager } from "../managers/ResourceCleanupManager";
import { DebugLogger } from "../utils/DebugLogger";

import { BoardService } from "../services/BoardService";
import { gameState } from "../services/GameState";
import { soundManager } from "../services/SoundManager";
import { preferencesService } from "../services/PreferencesService";
import { BrandBadge } from "../ui/BrandBadge";

export class GameScene extends BaseScene {

    private boardManager!: BoardManager;
    private boardService!: BoardService;
    private playerManager!: PlayerManager;
    private movementManager!: MovementManager;
    private session!: GameSessionManager;
    private uiManager!: UIManager;
    private diceManager!: DiceManager;
    private popupManager!: PopupManager;
    private gameplay!: GameplayCoordinator;
    private cleanup = new ResourceCleanupManager();
    private shuttingDown = false;

    constructor() {
        super(SceneKeys.GAME);
    }

    public create(): void {

        this.shuttingDown = false;
        this.cleanup = new ResourceCleanupManager();
        this.createGameBackground();
        new BrandBadge(this, {
            x: this.scale.width - 46,
            y: 40,
            diameter: 74,
            depth: 1900,
            frameless: true
        });

        this.boardManager = new BoardManager(this);
        this.boardManager.create();
        this.boardService = this.boardManager.getBoardService();

        this.playerManager = new PlayerManager(this, this.boardService);
        this.playerManager.createPlayers();

        this.movementManager = new MovementManager(
            this,
            this.boardService,
            this.playerManager
        );

        this.uiManager = new UIManager(this, {
            onExit: this.requestExit.bind(this),
            onPause: this.togglePause.bind(this),
            onSoundToggle: () => {
                const enabled = soundManager.toggle();
                preferencesService.setSoundEnabled(enabled);
                return enabled;
            },
            onFullscreenToggle: () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                    return false;
                }
                this.scale.startFullscreen();
                return true;
            }
        }, this.boardService.getTileCount());
        this.uiManager.create();
        this.uiManager.setSoundEnabled(soundManager.isEnabled());
        this.uiManager.setFullscreen(this.scale.isFullscreen);

        this.session = new GameSessionManager({
            playerCount: gameState.getPlayerCount(),
            uiManager: this.uiManager,
            flowHooks: {
                onPhaseChanged: phase => this.updatePhaseUi(phase),
                onPlayerChanged: playerIndex => {
                    this.uiManager.updatePlayer(playerIndex);
                    this.playerManager.setActivePlayer(playerIndex);
                    this.boardManager.focusTile(
                        this.playerManager.getPlayer(playerIndex).getTile()
                    );
                }
            },
            winHooks: {
                onWinner: playerIndex => this.gameplay.finishGame(playerIndex)
            }
        });
        this.popupManager = new PopupManager(this);

        this.diceManager = new DiceManager(this);
        this.gameplay = new GameplayCoordinator(
            this,
            this.session,
            this.diceManager,
            this.movementManager,
            this.popupManager,
            this.uiManager,
            {
                onWinner: playerIndex => this.presentWinner(playerIndex),
                onTileLanded: tileId => this.boardManager.focusTile(tileId)
            }
        );
        this.gameplay.start();

        this.cleanup.register("board manager", () => this.boardManager?.destroy());
        this.cleanup.register("player manager", () => this.playerManager?.destroy());
        this.cleanup.register("UI manager", () => this.uiManager?.destroy());
        this.cleanup.register("movement manager", () => this.movementManager?.destroy());
        this.cleanup.register("popup manager", () => this.popupManager?.destroy());
        this.cleanup.register("game session", () => this.session?.destroy());
        this.cleanup.register("gameplay coordinator", () => this.gameplay?.destroy());
        this.cleanup.register("scene tweens", () => this.tweens.killAll());
        this.cleanup.register("scene timers", () => this.time.removeAllEvents());
        this.cleanup.register("scene input listeners", () => this.input.removeAllListeners());
        this.cleanup.register("pending sounds", () => soundManager.stopAll());

        this.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.shutdown,
            this
        );
    }

    private createGameBackground(): void {
        this.add.rectangle(640, 360, 1280, 720, 0x10243f, 1).setDepth(-30);

        const glow = this.add.graphics().setDepth(-29);
        glow.fillStyle(0x244e74, 0.62);
        glow.fillRoundedRect(8, 108, 1264, 604, 28);
        glow.lineStyle(3, 0xe8bd61, 0.92);
        glow.strokeRoundedRect(8, 108, 1264, 604, 28);
    }

    private requestExit(): void {
        if (this.gameplay.isEnded() || this.popupManager.isExitOpen()) return;

        this.gameplay.suspendDice("ממתינים לאישור יציאה");
        this.popupManager.showExit(
            () => this.scene.start(SceneKeys.MENU),
            () => this.gameplay.resumeDice()
        );
    }

    private togglePause(): boolean {
        const paused = this.gameplay.togglePause();
        if (paused) {
            this.uiManager.showFeedback("⏸ המשחק מושהה", "#ffe28a", 1200);
        } else if (!this.gameplay.isEnded()) {
            this.uiManager.showFeedback("▶ המשחק ממשיך", "#bff3c8", 1000);
        }
        return paused;
    }

    private presentWinner(playerIndex: number): void {
        this.popupManager.showWinner(
            {
                winnerIndex: playerIndex,
                elapsedSeconds: this.session.stats.getElapsedSeconds(),
                players: this.session.stats.getPlayers()
            },
            () => this.scene.restart(),
            () => this.scene.start(SceneKeys.MENU)
        );
    }

    private updatePhaseUi(phase: TurnPhase): void {
        const labels: Record<TurnPhase, string> = {
            [TurnPhase.READY]: "מוכנים לזריקה",
            [TurnPhase.ROLLING]: "הקובייה מתגלגלת",
            [TurnPhase.MOVING]: "מזיזים את החייל",
            [TurnPhase.QUESTION]: "עונים על שאלה",
            [TurnPhase.RESOLVING]: "מעדכנים את התוצאה",
            [TurnPhase.ENDED]: "המשחק הסתיים"
        };
        this.uiManager?.updateStatus(labels[phase]);
    }

    private shutdown(): void {
        if (this.shuttingDown) return;
        this.shuttingDown = true;
        DebugLogger.info("CLEANUP", "GameScene shutdown started");
        this.cleanup.destroy();
        DebugLogger.info("CLEANUP", "GameScene shutdown completed");
    }
}

import Phaser from "phaser";

import { gameState } from "../services/GameState";
import { ScorePanel, ScorePanelPlayer } from "../ui/ScorePanel";
import { Theme } from "../theme/Theme";
import { AnimationManager } from "./AnimationManager";
import { ParticleEffectsManager } from "./ParticleEffectsManager";

export interface GameHudCallbacks {
    onExit: () => void;
    onPause?: () => boolean;
    onSoundToggle?: () => boolean;
    onFullscreenToggle?: () => boolean;
}

/** מרכז את רכיבי ה-HUD של סצנת המשחק ואת נתוני ההתקדמות החזותיים. */
export class UIManager {
    private scorePanel?: ScorePanel;
    private feedbackText?: Phaser.GameObjects.Text;
    private controlsContainer?: Phaser.GameObjects.Container;
    private readonly tiles = new Map<number, number>();
    private readonly correctAnswers = new Map<number, number>();
    private readonly animations: AnimationManager;
    private readonly particles: ParticleEffectsManager;
    private pauseIconText?: Phaser.GameObjects.Text;
    private pauseLabelText?: Phaser.GameObjects.Text;
    private soundIconText?: Phaser.GameObjects.Text;
    private soundLabelText?: Phaser.GameObjects.Text;
    private fullscreenIconText?: Phaser.GameObjects.Text;
    private fullscreenLabelText?: Phaser.GameObjects.Text;

    constructor(
        private readonly scene: Phaser.Scene,
        private readonly callbacks: GameHudCallbacks,
        private readonly finalTile: number
    ) {
        this.animations = new AnimationManager(scene);
        this.particles = new ParticleEffectsManager(scene);
    }

    public create(): void {
        gameState.getPlayers().forEach((_player, index) => {
            this.tiles.set(index, 1);
            this.correctAnswers.set(index, 0);
        });

        this.scorePanel = new ScorePanel(this.scene, {
            width: this.scene.scale.width,
            height: 112,
            depth: 1000,
            finalTile: this.finalTile
        });

        this.scorePanel.setPlayers(this.buildPlayers());
        this.scorePanel.setCurrentPlayer(0);
        this.createControls();
    }

    public updatePlayer(playerIndex: number): void {
        this.scorePanel?.setCurrentPlayer(playerIndex);
    }

    public updateStatus(status: string): void {
        const warning = status.includes("מושהה") || status.includes("ממתינים");
        const active = status.includes("שאלה") || status.includes("מתגלגלת") || status.includes("מזיזים");
        this.scorePanel?.setStatus(status, warning ? 0xf2b93b : active ? 0x5fb4e8 : 0x78d58b);
    }

    public updateDice(value: number): void {
        this.scorePanel?.setLastDiceValue(value);
    }

    public updatePlayerTile(playerIndex: number, tile: number): void {
        this.tiles.set(playerIndex, tile);
        this.refreshScores();
    }

    public registerCorrectAnswer(playerIndex: number): void {
        this.correctAnswers.set(playerIndex, (this.correctAnswers.get(playerIndex) ?? 0) + 1);
        this.refreshScores();
    }

    public refreshScores(): void {
        this.scorePanel?.updatePlayers(this.buildPlayers());
    }

    public showFeedback(message: string, color = "#ffffff", duration = 1200): void {
        this.feedbackText?.destroy();
        this.feedbackText = this.animations.showFeedback(message, { color, duration });
    }


    public celebrateAnswer(): void {
        this.particles.celebrate(this.scene.scale.width / 2, Math.min(610, this.scene.scale.height * 0.62));
    }

    public encourageRetry(): void {
        this.particles.encourage(this.scene.scale.width / 2, Math.min(610, this.scene.scale.height * 0.62));
    }

    public setPaused(paused: boolean): void {
        this.pauseIconText?.setText(paused ? "▶" : "Ⅱ");
        this.pauseLabelText?.setText(paused ? "המשך" : "השהיה");
        this.updateStatus(paused ? "המשחק מושהה" : "מוכנים לזריקה");
    }

    public setSoundEnabled(enabled: boolean): void {
        this.soundIconText?.setText(enabled ? "🔊" : "🔇");
        this.soundLabelText?.setText(enabled ? "צליל" : "מושתק");
    }

    public setFullscreen(enabled: boolean): void {
        this.fullscreenIconText?.setText(enabled ? "↙" : "⛶");
        this.fullscreenLabelText?.setText(enabled ? "חלון" : "מסך מלא");
    }

    public destroy(): void {
        this.feedbackText?.destroy();
        this.feedbackText = undefined;
        this.controlsContainer?.destroy(true);
        this.controlsContainer = undefined;
        this.scorePanel?.destroy(true);
        this.particles.destroy();
        this.animations.destroy();
        this.scorePanel = undefined;
        this.tiles.clear();
        this.correctAnswers.clear();
    }

    private createControls(): void {
        this.controlsContainer = this.scene.add.container(0, 0).setDepth(1700).setScrollFactor(0);
        const y = 145;
        const exit = this.createHudButton(44, y, "↩", "יציאה", Theme.colors.red, this.callbacks.onExit);
        const pause = this.createHudButton(116, y, "Ⅱ", "השהיה", 0x425f93, () => {
            const paused = this.callbacks.onPause?.() ?? false;
            this.setPaused(paused);
        }, (iconText, labelText) => {
            this.pauseIconText = iconText;
            this.pauseLabelText = labelText;
        });
        const sound = this.createHudButton(188, y, "🔊", "צליל", 0x2c756f, () => {
            const enabled = this.callbacks.onSoundToggle?.() ?? true;
            this.setSoundEnabled(enabled);
        }, (iconText, labelText) => {
            this.soundIconText = iconText;
            this.soundLabelText = labelText;
        });
        const fullscreen = this.createHudButton(260, y, "⛶", "מסך מלא", 0x6f3fb4, () => {
            const enabled = this.callbacks.onFullscreenToggle?.() ?? this.scene.scale.isFullscreen;
            this.setFullscreen(enabled);
        }, (iconText, labelText) => {
            this.fullscreenIconText = iconText;
            this.fullscreenLabelText = labelText;
        });
        this.controlsContainer.add([exit, pause, sound, fullscreen]);
        this.setFullscreen(this.scene.scale.isFullscreen);
    }

    private createHudButton(
        x: number,
        y: number,
        icon: string,
        label: string,
        color: number,
        callback: () => void,
        onCreated?: (iconText: Phaser.GameObjects.Text, labelText: Phaser.GameObjects.Text) => void
    ): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);
        const shadow = this.scene.add.rectangle(3, 4, 64, 54, 0x000000, 0.3).setOrigin(0.5);
        const background = this.scene.add.rectangle(0, 0, 64, 54, color, 0.98)
            .setStrokeStyle(2, Theme.colors.border)
            .setInteractive({ useHandCursor: true });
        const iconText = this.scene.add.text(0, -7, icon, {
            fontFamily: Theme.fonts.family,
            fontSize: "23px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);
        const labelText = this.scene.add.text(0, 17, label, {
            fontFamily: Theme.fonts.family,
            fontSize: "10px",
            color: "#fff8e3",
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0.5);
        onCreated?.(iconText, labelText);
        container.add([shadow, background, iconText, labelText]);
        background.on("pointerover", () => this.animations.hover(container, true));
        background.on("pointerout", () => this.animations.hover(container, false));
        background.on("pointerdown", () => {
            this.animations.pulse(container, 0.96, Theme.motion.fast);
            callback();
        });
        return container;
    }

    private buildPlayers(): ScorePanelPlayer[] {
        return gameState.getPlayers().map((player, index) => ({
            id: index,
            name: player.name || `שחקן ${index + 1}`,
            score: gameState.getScore(player.id),
            tile: this.tiles.get(index) ?? 1,
            correctAnswers: this.correctAnswers.get(index) ?? 0
        }));
    }
}

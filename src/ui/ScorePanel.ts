import Phaser from "phaser";

import { Theme } from "../theme/Theme";

export interface ScorePanelPlayer {
    id: number;
    name: string;
    score: number;
    tile: number;
    correctAnswers: number;
}

export interface ScorePanelConfig {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    depth?: number;
    finalTile?: number;
}

/** HUD ראשי: שחקן פעיל, התקדמות, ניקוד, קובייה ומצב המשחק. */
export class ScorePanel extends Phaser.GameObjects.Container {
    private readonly panelWidth: number;
    private readonly panelHeight: number;
    private readonly finalTile: number;
    private readonly activeContainer: Phaser.GameObjects.Container;
    private readonly playersContainer: Phaser.GameObjects.Container;
    private readonly statusText: Phaser.GameObjects.Text;
    private readonly statusDot: Phaser.GameObjects.Arc;
    private readonly diceValueText: Phaser.GameObjects.Text;
    private readonly progressFill: Phaser.GameObjects.Rectangle;
    private readonly progressLabel: Phaser.GameObjects.Text;

    private players: ScorePanelPlayer[] = [];
    private currentPlayerId: number | null = null;
    private lastDiceValue: number | null = null;
    private destroyed = false;

    constructor(scene: Phaser.Scene, config: ScorePanelConfig = {}) {
        const panelWidth = config.width ?? scene.scale.width;
        const panelHeight = config.height ?? 112;
        super(scene, config.x ?? scene.scale.width / 2, config.y ?? panelHeight / 2);

        this.panelWidth = panelWidth;
        this.panelHeight = panelHeight;
        this.finalTile = Math.max(2, config.finalTile ?? 100);

        const shadow = scene.add.rectangle(0, 5, panelWidth, panelHeight, 0x000000, 0.3);
        const background = scene.add.rectangle(0, 0, panelWidth, panelHeight, Theme.colors.backgroundSoft, 0.99)
            .setStrokeStyle(3, Theme.colors.border, 0.95);
        const inner = scene.add.rectangle(0, 1, panelWidth - 14, panelHeight - 14, Theme.colors.panel, 0.76)
            .setStrokeStyle(1, 0x4c7398, 0.5);

        this.activeContainer = scene.add.container(-panelWidth / 2 + 194, 0);
        this.playersContainer = scene.add.container(76, 0);

        const statusPanel = scene.add.rectangle(panelWidth / 2 - 221, -23, 206, 38, 0x173f5f, 0.98)
            .setStrokeStyle(2, Theme.colors.border, 0.86);
        this.statusDot = scene.add.circle(panelWidth / 2 - 302, -23, 6, 0x78d58b, 1);
        this.statusText = scene.add.text(panelWidth / 2 - 213, -23, "מוכנים לזריקה", {
            fontFamily: Theme.fonts.family,
            fontSize: "17px",
            color: Theme.colors.cream,
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0.5);

        const dicePanel = scene.add.rectangle(panelWidth / 2 - 221, 26, 206, 45, 0x0d3157, 0.98)
            .setStrokeStyle(2, 0x6fa6d8, 0.75);
        const diceLabel = scene.add.text(panelWidth / 2 - 288, 26, "קובייה אחרונה", {
            fontFamily: Theme.fonts.family,
            fontSize: "13px",
            color: "#b9d7f4",
            rtl: true
        }).setOrigin(0.5);
        this.diceValueText = scene.add.text(panelWidth / 2 - 158, 26, "—", {
            fontFamily: Theme.fonts.family,
            fontSize: "28px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);
        const diceIcon = scene.add.text(panelWidth / 2 - 198, 25, "🎲", {
            fontFamily: Theme.fonts.family,
            fontSize: "24px"
        }).setOrigin(0.5);

        const progressBack = scene.add.rectangle(-panelWidth / 2 + 194, 43, 310, 9, 0x081a2d, 0.92)
            .setOrigin(0.5)
            .setStrokeStyle(1, 0x6fa6d8, 0.55);
        this.progressFill = scene.add.rectangle(-panelWidth / 2 + 39, 43, 0, 7, Theme.colors.gold, 1)
            .setOrigin(0, 0.5);
        this.progressLabel = scene.add.text(-panelWidth / 2 + 194, 57, "התקדמות: 1%", {
            fontFamily: Theme.fonts.family,
            fontSize: "12px",
            color: "#b9d7f4",
            rtl: true
        }).setOrigin(0.5);

        this.add([
            shadow, background, inner,
            this.activeContainer, this.playersContainer,
            statusPanel, this.statusDot, this.statusText,
            dicePanel, diceLabel, diceIcon, this.diceValueText,
            progressBack, this.progressFill, this.progressLabel
        ]);

        this.setDepth(config.depth ?? 1000).setScrollFactor(0);
        scene.add.existing(this);
        scene.tweens.add({ targets: this.statusDot, alpha: 0.35, duration: 650, yoyo: true, repeat: -1 });

        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this);
        scene.events.once(Phaser.Scenes.Events.DESTROY, this.handleSceneShutdown, this);
    }

    public setPlayers(players: ScorePanelPlayer[]): void {
        this.players = players.map(player => ({ ...player }));
        this.render();
    }

    public setCurrentPlayer(playerId: number): void {
        this.currentPlayerId = playerId;
        this.render();
    }

    public updatePlayers(players: ScorePanelPlayer[]): void {
        this.setPlayers(players);
    }

    public setStatus(status: string, color = 0x78d58b): void {
        this.statusText.setText(status);
        this.statusDot.setFillStyle(color, 1);
    }

    public setLastDiceValue(value: number): void {
        this.lastDiceValue = value;
        this.diceValueText.setText(String(value));
        this.scene.tweens.add({
            targets: this.diceValueText,
            scaleX: 1.24,
            scaleY: 1.24,
            duration: Theme.motion.fast,
            yoyo: true
        });
    }

    public clearLastDiceValue(): void {
        this.lastDiceValue = null;
        this.diceValueText.setText("—");
    }

    public getLastDiceValue(): number | null {
        return this.lastDiceValue;
    }

    public destroy(fromScene?: boolean): void {
        if (this.destroyed) return;
        this.destroyed = true;
        if (this.scene) {
            this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.handleSceneShutdown, this);
            this.scene.events.off(Phaser.Scenes.Events.DESTROY, this.handleSceneShutdown, this);
        }
        this.activeContainer.removeAll(true);
        this.playersContainer.removeAll(true);
        super.destroy(fromScene);
    }

    private render(): void {
        this.activeContainer.removeAll(true);
        this.playersContainer.removeAll(true);
        if (this.players.length === 0) return;

        const active = this.players.find(player => player.id === this.currentPlayerId) ?? this.players[0];
        this.renderActivePlayer(active);
        this.renderOtherPlayers(active.id);

        const progress = Phaser.Math.Clamp(active.tile / this.finalTile, 0, 1);
        const maxWidth = 310;
        this.progressFill.width = Math.max(4, maxWidth * progress);
        this.progressLabel.setText(`התקדמות: ${Math.round(progress * 100)}%  •  משבצת ${active.tile}`);
    }

    private renderActivePlayer(player: ScorePanelPlayer): void {
        const accent = this.getPlayerAccent(player.id);
        const glow = this.scene.add.rectangle(0, 0, 334, 72, accent, 0.2)
            .setStrokeStyle(3, Theme.colors.gold, 1);
        const avatar = this.scene.add.circle(-133, 0, 23, accent, 1)
            .setStrokeStyle(3, 0xffffff, 0.9);
        const number = this.scene.add.text(-133, 0, String(player.id + 1), {
            fontFamily: Theme.fonts.family,
            fontSize: "21px",
            color: "#ffffff",
            fontStyle: "bold"
        }).setOrigin(0.5);
        const label = this.scene.add.text(-96, -21, "השחקן הפעיל", {
            fontFamily: Theme.fonts.family,
            fontSize: "12px",
            color: "#ffe39a",
            rtl: true
        }).setOrigin(0, 0.5);
        const name = this.scene.add.text(-96, 2, player.name, {
            fontFamily: Theme.fonts.family,
            fontSize: "22px",
            color: "#ffffff",
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0, 0.5);
        const stats = this.scene.add.text(146, 2, `⭐ ${player.score}   ✓ ${player.correctAnswers}`, {
            fontFamily: Theme.fonts.family,
            fontSize: "16px",
            color: "#fff1bd",
            fontStyle: "bold",
            rtl: true
        }).setOrigin(1, 0.5);
        const tile = this.scene.add.text(146, 24, `מיקום ${player.tile}`, {
            fontFamily: Theme.fonts.family,
            fontSize: "13px",
            color: "#cbe4fb",
            rtl: true
        }).setOrigin(1, 0.5);
        this.activeContainer.add([glow, avatar, number, label, name, stats, tile]);
    }

    private renderOtherPlayers(activeId: number): void {
        const others = this.players.filter(player => player.id !== activeId);
        const availableWidth = 420;
        const cardWidth = others.length > 0 ? Math.min(132, (availableWidth - (others.length - 1) * 10) / others.length) : 0;
        const totalWidth = others.length * cardWidth + Math.max(0, others.length - 1) * 10;
        const startX = -totalWidth / 2 + cardWidth / 2;

        others.forEach((player, index) => {
            const card = this.createCompactCard(player, cardWidth);
            card.setPosition(startX + index * (cardWidth + 10), 0);
            this.playersContainer.add(card);
        });
    }

    private createCompactCard(player: ScorePanelPlayer, width: number): Phaser.GameObjects.Container {
        const container = this.scene.add.container(0, 0);
        const accent = this.getPlayerAccent(player.id);
        const background = this.scene.add.rectangle(0, 0, width, 72, 0x0d3157, 0.94)
            .setStrokeStyle(2, accent, 0.9);
        const strip = this.scene.add.rectangle(-width / 2 + 4, 0, 6, 62, accent, 1);
        const name = this.scene.add.text(0, -21, player.name, {
            fontFamily: Theme.fonts.family,
            fontSize: "15px",
            color: "#ffffff",
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0.5);
        const score = this.scene.add.text(0, 1, `⭐ ${player.score}  •  📍 ${player.tile}`, {
            fontFamily: Theme.fonts.family,
            fontSize: "13px",
            color: "#ffe19a",
            rtl: true
        }).setOrigin(0.5);
        const correct = this.scene.add.text(0, 23, `תשובות נכונות: ${player.correctAnswers}`, {
            fontFamily: Theme.fonts.family,
            fontSize: "11px",
            color: "#b9d7f4",
            rtl: true
        }).setOrigin(0.5);
        container.add([background, strip, name, score, correct]);
        return container;
    }

    private getPlayerAccent(playerId: number): number {
        return [0x4f9c38, 0x3478c7, 0xb14d72, 0xe08b2f][playerId % 4];
    }

    private handleSceneShutdown(): void {
        this.destroy(true);
    }
}

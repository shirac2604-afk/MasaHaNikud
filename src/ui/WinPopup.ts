import Phaser from "phaser";

import { PlayerGameStats } from "../managers/GameStatsManager";
import { BasePopup } from "./BasePopup";
import { preferencesService } from "../services/PreferencesService";

export interface WinSummary {
    winnerIndex: number;
    elapsedSeconds: number;
    players: PlayerGameStats[];
}

/** מסך סיום עשיר עם מנצח, דירוג ונתוני הצלחה. */
export class WinPopup extends BasePopup {
    private readonly content: Phaser.GameObjects.Container;
    private readonly restartButton: Phaser.GameObjects.Container;
    private readonly menuButton: Phaser.GameObjects.Container;
    private restartCallback?: () => void;
    private menuCallback?: () => void;
    private readonly celebrationObjects = new Set<Phaser.GameObjects.GameObject>();

    constructor(scene: Phaser.Scene) {
        super(scene, 820, 560);
        this.panel.setFillStyle(0x102f52, 0.99).setStrokeStyle(5, 0xe8bd61, 1);

        const halo = scene.add.circle(0, -188, 78, 0xf5c451, 0.16)
            .setStrokeStyle(3, 0xffe6a5, 0.8);
        const trophy = scene.add.text(0, -190, "🏆", {
            fontFamily: "Arial",
            fontSize: "72px"
        }).setOrigin(0.5);

        const title = scene.add.text(0, -118, "יש לנו מנצח!", {
            fontFamily: "Arial",
            fontSize: "38px",
            color: "#fff1b5",
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0.5);

        this.content = scene.add.container(0, 12);
        this.restartButton = this.createButton(-150, 225, "🔄 משחק נוסף", 0x2d8f62, () => {
            this.close(() => this.restartCallback?.());
        });
        this.menuButton = this.createButton(150, 225, "⌂ לתפריט", 0x345f91, () => {
            this.close(() => this.menuCallback?.());
        });

        this.add([halo, trophy, title, this.content, this.restartButton, this.menuButton]);
        scene.tweens.add({ targets: trophy, y: -198, duration: 720, yoyo: true, repeat: -1, ease: "Sine.InOut" });
        scene.tweens.add({ targets: halo, scaleX: 1.12, scaleY: 1.12, alpha: 0.32, duration: 900, yoyo: true, repeat: -1 });
    }

    public show(summary: WinSummary, onRestart?: () => void, onMenu?: () => void): void {
        this.restartCallback = onRestart;
        this.menuCallback = onMenu;
        this.renderSummary(summary);
        this.playCelebration();
        this.open();
    }

    public destroy(fromScene?: boolean): void {
        this.clearCelebration();
        this.content.removeAll(true);
        this.restartButton.each((child: Phaser.GameObjects.GameObject) => child.removeAllListeners());
        this.menuButton.each((child: Phaser.GameObjects.GameObject) => child.removeAllListeners());
        this.restartCallback = undefined;
        this.menuCallback = undefined;
        super.destroy(fromScene);
    }


    private playCelebration(): void {
        this.clearCelebration();
        if (preferencesService.isReducedMotion()) return;

        const colors = [0xf5c451, 0x55c878, 0x5fb4e8, 0xf08b65, 0x9b78df];
        const camera = this.scene.cameras.main;
        for (let index = 0; index < 34; index += 1) {
            const x = Phaser.Math.Between(camera.centerX - 390, camera.centerX + 390);
            const y = camera.centerY - 330 - Phaser.Math.Between(0, 160);
            const width = Phaser.Math.Between(6, 12);
            const height = Phaser.Math.Between(10, 20);
            const piece = this.scene.add.rectangle(
                x,
                y,
                width,
                height,
                Phaser.Utils.Array.GetRandom(colors),
                0.95
            ).setDepth(2600).setAngle(Phaser.Math.Between(0, 180));
            this.celebrationObjects.add(piece);

            this.scene.tweens.add({
                targets: piece,
                x: x + Phaser.Math.Between(-90, 90),
                y: camera.centerY + 360,
                angle: piece.angle + Phaser.Math.Between(240, 760),
                alpha: 0,
                duration: Phaser.Math.Between(1500, 2400),
                delay: Phaser.Math.Between(0, 420),
                ease: "Sine.In",
                onComplete: () => {
                    this.celebrationObjects.delete(piece);
                    if (piece.active) piece.destroy();
                }
            });
        }
    }

    private clearCelebration(): void {
        this.celebrationObjects.forEach(object => {
            this.scene.tweens.killTweensOf(object);
            if (object.active) object.destroy();
        });
        this.celebrationObjects.clear();
    }

    private renderSummary(summary: WinSummary): void {
        this.content.removeAll(true);
        const winner = summary.players.find(player => player.playerIndex === summary.winnerIndex);
        const ordered = [...summary.players].sort((a, b) => {
            if (a.playerIndex === summary.winnerIndex) return -1;
            if (b.playerIndex === summary.winnerIndex) return 1;
            return b.score - a.score || b.accuracy - a.accuracy;
        });

        const winnerName = winner?.name ?? `שחקן ${summary.winnerIndex + 1}`;
        const accuracy = winner?.accuracy ?? 0;
        const medal = this.getMedal(accuracy);
        const winnerText = this.scene.add.text(0, -82, `${winnerName} ניצח!`, {
            fontFamily: "Arial",
            fontSize: "34px",
            color: "#ffffff",
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0.5);
        const timeText = this.scene.add.text(0, -48, `משך המשחק: ${this.formatTime(summary.elapsedSeconds)}`, {
            fontFamily: "Arial",
            fontSize: "18px",
            color: "#b9d7f4",
            rtl: true
        }).setOrigin(0.5);

        const summaryPanel = this.scene.add.rectangle(0, 4, 650, 72, 0x173f68, 0.96)
            .setStrokeStyle(2, 0xe8bd61, 0.95);
        const medalText = this.scene.add.text(-270, 4, `${medal.icon} ${medal.label}`, {
            fontFamily: "Arial",
            fontSize: "22px",
            color: medal.color,
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0, 0.5);
        const learningText = this.scene.add.text(290, 4,
            `📚 ${winner?.totalAnswers ?? 0} שאלות  •  ✅ ${winner?.correctAnswers ?? 0} נכונות  •  🎯 ${accuracy}%`, {
                fontFamily: "Arial",
                fontSize: "19px",
                color: "#ffffff",
                rtl: true
            }).setOrigin(1, 0.5);

        this.content.add([winnerText, timeText, summaryPanel, medalText, learningText]);

        const rowWidth = 650;
        ordered.slice(0, 4).forEach((player, index) => {
            const y = 58 + index * 45;
            const active = player.playerIndex === summary.winnerIndex;
            const row = this.scene.add.rectangle(0, y, rowWidth, 38, active ? 0xfff1bf : 0x173f68, active ? 1 : 0.92)
                .setStrokeStyle(active ? 3 : 1, active ? 0xf2bf49 : 0x5b8fbd, 1);
            const rank = this.scene.add.text(-295, y, `${index + 1}`, {
                fontFamily: "Arial", fontSize: "19px", color: active ? "#6b4300" : "#ffffff", fontStyle: "bold"
            }).setOrigin(0.5);
            const name = this.scene.add.text(-240, y, player.name, {
                fontFamily: "Arial", fontSize: "17px", color: active ? "#163d65" : "#ffffff", fontStyle: "bold", rtl: true
            }).setOrigin(0, 0.5);
            const stats = this.scene.add.text(295, y, `⭐ ${player.score}   ✓ ${player.correctAnswers}/${player.totalAnswers}   ${player.accuracy}%`, {
                fontFamily: "Arial", fontSize: "16px", color: active ? "#704700" : "#d8ecff", rtl: true
            }).setOrigin(1, 0.5);
            this.content.add([row, rank, name, stats]);
        });
    }

    private getMedal(accuracy: number): { icon: string; label: string; color: string } {
        if (accuracy >= 90) return { icon: "🥇", label: "מדליית זהב", color: "#ffe07a" };
        if (accuracy >= 75) return { icon: "🥈", label: "מדליית כסף", color: "#e5edf7" };
        return { icon: "🥉", label: "מדליית ארד", color: "#f0b47a" };
    }

    private createButton(x: number, y: number, label: string, color: number, callback: () => void): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);
        const shadow = this.scene.add.rectangle(4, 5, 250, 62, 0x000000, 0.28);
        const background = this.scene.add.rectangle(0, 0, 250, 62, color, 1)
            .setStrokeStyle(3, 0xffe4a0, 0.95)
            .setInteractive({ useHandCursor: true });
        const text = this.scene.add.text(0, 0, label, {
            fontFamily: "Arial", fontSize: "22px", color: "#ffffff", fontStyle: "bold", rtl: true
        }).setOrigin(0.5);
        container.add([shadow, background, text]);
        background.on("pointerover", () => this.scene.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 }));
        background.on("pointerout", () => this.scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 }));
        background.on("pointerdown", callback);
        return container;
    }

    private formatTime(totalSeconds: number): string {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
}

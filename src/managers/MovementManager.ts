import Phaser from "phaser";

import { BoardTransition } from "../data/boardLayouts/BoardLayouts";
import { Tile } from "../models/Tile";
import { BoardService } from "../services/BoardService";
import { PlayerManager } from "./PlayerManager";
import { soundManager } from "../services/SoundManager";
import { preferencesService } from "../services/PreferencesService";

/**
 * מנהל תנועה ידנית: לאחר זריקת הקובייה השחקן גורר את החייל פעם אחת
 * ישירות אל משבצת היעד. שחרור במקום שגוי מחזיר את החייל לנקודת המוצא.
 */
export interface MovementResult {
    tile: Tile;
    transitionKind?: "ladder" | "snake";
}

export class MovementManager {
    private marker?: Phaser.GameObjects.Arc;
    private instruction?: Phaser.GameObjects.Text;
    private activeSprite?: Phaser.GameObjects.Image;
    private transitionNotice?: Phaser.GameObjects.Text;
    private movementSequence = 0;
    private destroyed = false;
    private readonly transientEffects = new Set<Phaser.GameObjects.GameObject>();
    private readonly landingTimers = new Set<Phaser.Time.TimerEvent>();

    private dragHandler?: (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject,
        dragX: number,
        dragY: number
    ) => void;

    private dragEndHandler?: (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.GameObject
    ) => void;

    constructor(
        private readonly scene: Phaser.Scene,
        private readonly boardService: BoardService,
        private readonly playerManager: PlayerManager
    ) {}

    public movePlayer(
        playerIndex: number,
        steps: number,
        onComplete?: (result: MovementResult) => void
    ): void {
        if (this.destroyed) return;
        this.cleanupInput();
        const sequence = ++this.movementSequence;

        const player = this.playerManager.getPlayer(playerIndex);
        const destinationId = Math.min(
            player.getTile() + steps,
            this.boardService.getTileCount()
        );
        const destination = this.boardService.getTile(destinationId);

        if (!destination || destinationId === player.getTile()) {
            this.finishMovement(playerIndex, sequence, onComplete);
            return;
        }

        const sprite = player.getSprite();
        const target = player.getBoardPosition(destination.x, destination.y);
        const originX = sprite.x;
        const originY = sprite.y;

        this.marker = this.scene.add.circle(
            target.x,
            target.y - 16,
            38,
            0xffeb3b,
            0.28
        ).setStrokeStyle(6, 0xffc107, 1).setDepth(90);

        if (!preferencesService.isReducedMotion()) {
            this.scene.tweens.add({
                targets: this.marker,
                scale: 1.22,
                alpha: 0.78,
                duration: 520,
                yoyo: true,
                repeat: -1
            });
        }

        const camera = this.scene.cameras.main;
        const instructionX = Math.max(145, camera.width - 145);
        const instructionY = Phaser.Math.Clamp(camera.height - 165, 430, camera.height - 120);
        this.instruction = this.scene.add.text(
            instructionX,
            instructionY,
            `גררו את החייל פעם אחת\nלמשבצת ${destinationId}\n(${steps} צעדים בקובייה)`,
            {
                fontFamily: "Arial",
                fontSize: "21px",
                color: "#ffffff",
                fontStyle: "bold",
                align: "center",
                rtl: true,
                backgroundColor: "#173f5f",
                padding: { x: 16, y: 13 }
            }
        ).setOrigin(0.5).setDepth(1200);

        this.activeSprite = sprite;
        sprite.setInteractive({ useHandCursor: true, draggable: true }).setDepth(1400);
        this.scene.input.setDraggable(sprite);

        this.dragHandler = (_pointer, gameObject, dragX, dragY) => {
            if (gameObject !== sprite) {
                return;
            }

            player.setDraggedPosition(dragX, dragY);
        };

        this.dragEndHandler = (_pointer, gameObject) => {
            if (this.destroyed || sequence !== this.movementSequence || gameObject !== sprite) {
                return;
            }

            const distance = Phaser.Math.Distance.Between(
                sprite.x,
                sprite.y,
                target.x,
                target.y
            );

            sprite.disableInteractive();

            if (distance > 92) {
                player.animateToPosition(
                    this.scene,
                    originX,
                    originY,
                    190,
                    () => {
                        if (!this.destroyed && sequence === this.movementSequence) {
                            this.activateDrag(playerIndex, steps, destinationId, sequence, onComplete);
                        }
                    }
                );
                return;
            }

            this.cleanupInput(false);
            player.animateToPosition(
                this.scene,
                target.x,
                target.y,
                preferencesService.isReducedMotion() ? 100 : 230,
                () => {
                    if (this.destroyed || sequence !== this.movementSequence) return;
                    player.setTile(destination.id);
                    this.finishMovement(playerIndex, sequence, onComplete);
                },
                preferencesService.isReducedMotion() ? "Linear" : "Back.Out"
            );
        };

        this.scene.input.on("drag", this.dragHandler);
        this.scene.input.on("dragend", this.dragEndHandler);
    }

    private activateDrag(
        playerIndex: number,
        steps: number,
        destinationId: number,
        sequence: number,
        onComplete?: (result: MovementResult) => void
    ): void {
        // מפעיל מחדש את אותו יעד לאחר שחרור שגוי, בלי לזרוק שוב קובייה.
        const player = this.playerManager.getPlayer(playerIndex);
        const destination = this.boardService.getTile(destinationId);

        if (!destination || this.destroyed || sequence !== this.movementSequence) {
            return;
        }

        const sprite = player.getSprite();
        sprite.setInteractive({ useHandCursor: true, draggable: true }).setDepth(1400);
        this.scene.input.setDraggable(sprite);

        if (this.instruction) {
            this.instruction.setText(
                `נסו שוב — גררו פעם אחת\nלמשבצת ${destinationId}\n(${steps} צעדים בקובייה)`
            );
        }
    }

    private finishMovement(
        playerIndex: number,
        sequence: number,
        onComplete?: (result: MovementResult) => void
    ): void {
        if (this.destroyed || sequence !== this.movementSequence) return;
        this.cleanupInput();

        const player = this.playerManager.getPlayer(playerIndex);
        const transition = this.boardService.getTransition(player.getTile());

        if (transition) {
            this.applyBoardTransition(playerIndex, transition, sequence, onComplete);
            return;
        }

        this.emitLandingResult(playerIndex, sequence, onComplete);
    }

    private applyBoardTransition(
        playerIndex: number,
        transition: BoardTransition,
        sequence: number,
        onComplete?: (result: MovementResult) => void
    ): void {
        const player = this.playerManager.getPlayer(playerIndex);
        const destination = this.boardService.getTile(transition.to);

        if (!destination) {
            this.emitLandingResult(playerIndex, sequence, onComplete);
            return;
        }

        const message = transition.kind === "ladder"
            ? `🪜 עלית בסולם למשבצת ${transition.to}`
            : `🐍 ירדת בנחש למשבצת ${transition.to}`;

        if (transition.kind === "ladder") {
            soundManager.playLadder();
        } else {
            soundManager.playSnake();
        }

        this.transitionNotice?.destroy();
        const notice = this.scene.add.text(
            this.scene.cameras.main.centerX,
            130,
            message,
            {
                fontFamily: "Arial",
                fontSize: "28px",
                color: "#ffffff",
                fontStyle: "bold",
                stroke: "#000000",
                strokeThickness: 5,
                rtl: true
            }
        ).setOrigin(0.5).setDepth(1700);
        this.transitionNotice = notice;

        const target = player.getBoardPosition(destination.x, destination.y);
        this.playTransitionTrail(
            player.getSprite().x,
            player.getSprite().y - 18,
            target.x,
            target.y - 18,
            transition.kind
        );

        player.animateToPosition(
            this.scene,
            target.x,
            target.y,
            preferencesService.isReducedMotion() ? 220 : 650,
            () => {
                if (this.destroyed || sequence !== this.movementSequence) return;
                player.setTile(destination.id);
                this.scene.tweens.add({
                    targets: notice,
                    alpha: 0,
                    y: 110,
                    duration: 220,
                    onComplete: () => {
                        if (notice.active) notice.destroy();
                        if (this.transitionNotice === notice) this.transitionNotice = undefined;
                    }
                });
                this.emitLandingResult(playerIndex, sequence, onComplete, transition.kind);
            },
            preferencesService.isReducedMotion() ? "Linear" : (transition.kind === "ladder" ? "Back.Out" : "Sine.InOut")
        );
    }

    private emitLandingResult(
        playerIndex: number,
        sequence: number,
        onComplete?: (result: MovementResult) => void,
        transitionKind?: "ladder" | "snake"
    ): void {
        if (this.destroyed || sequence !== this.movementSequence) return;
        const player = this.playerManager.getPlayer(playerIndex);
        const tile = this.boardService.getTile(player.getTile());

        if (!tile) {
            return;
        }

        this.playLandingFeedback(tile.centerX, tile.centerY, transitionKind);
        player.celebrateLanding(this.scene);

        // Give the learner a brief visual connection between the highlighted
        // syllable and the question that opens next. Reduced-motion mode keeps
        // the pause short while preserving the same game flow.
        const delay = preferencesService.isReducedMotion() ? 90 : 360;
        const timer = this.scene.time.delayedCall(delay, () => {
            this.landingTimers.delete(timer);
            if (this.destroyed || sequence !== this.movementSequence) return;
            onComplete?.({ tile, transitionKind });
        });
        this.landingTimers.add(timer);
    }


    private playTransitionTrail(
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        kind: "ladder" | "snake"
    ): void {
        if (this.destroyed || preferencesService.isReducedMotion()) return;

        const color = kind === "ladder" ? 0xf7d65c : 0x72d99b;
        const points = 9;
        for (let index = 0; index < points; index += 1) {
            const progress = index / (points - 1);
            const x = Phaser.Math.Linear(fromX, toX, progress);
            const y = Phaser.Math.Linear(fromY, toY, progress);
            const dot = this.scene.add.circle(x, y, 5, color, 0)
                .setDepth(1350)
                .setScale(0.55);
            this.transientEffects.add(dot);
            this.scene.tweens.add({
                targets: dot,
                alpha: { from: 0, to: 0.82 },
                scale: { from: 0.55, to: 1.15 },
                duration: 150,
                delay: index * 42,
                yoyo: true,
                hold: 110,
                onComplete: () => this.releaseEffect(dot)
            });
        }
    }

    private playLandingFeedback(
        x: number,
        y: number,
        transitionKind?: "ladder" | "snake"
    ): void {
        if (this.destroyed) return;

        const color = transitionKind === "ladder"
            ? 0xf7d65c
            : transitionKind === "snake"
                ? 0x72d99b
                : 0x68c7ff;
        const glow = this.scene.add.circle(x, y, 34, color, 0.14)
            .setDepth(1298);
        const ring = this.scene.add.circle(x, y, 25, color, 0.06)
            .setStrokeStyle(5, color, 0.96)
            .setDepth(1300);
        this.transientEffects.add(glow);
        this.transientEffects.add(ring);

        if (preferencesService.isReducedMotion()) {
            const timer = this.scene.time.delayedCall(220, () => {
                this.landingTimers.delete(timer);
                this.releaseEffect(glow);
                this.releaseEffect(ring);
            });
            this.landingTimers.add(timer);
            return;
        }

        this.scene.tweens.add({
            targets: glow,
            scale: 1.55,
            alpha: 0,
            duration: 460,
            ease: "Quad.Out",
            onComplete: () => this.releaseEffect(glow)
        });
        this.scene.tweens.add({
            targets: ring,
            scale: 1.85,
            alpha: 0,
            duration: 460,
            ease: "Back.Out",
            onComplete: () => this.releaseEffect(ring)
        });
    }

    private releaseEffect(effect: Phaser.GameObjects.GameObject): void {
        this.transientEffects.delete(effect);
        if (effect.active) effect.destroy();
    }

    private clearTransientEffects(): void {
        this.transientEffects.forEach(effect => {
            this.scene.tweens.killTweensOf(effect);
            if (effect.active) effect.destroy();
        });
        this.transientEffects.clear();
    }

    private cleanupInput(removeVisuals = true): void {
        if (this.dragHandler) {
            this.scene.input.off("drag", this.dragHandler);
        }

        if (this.dragEndHandler) {
            this.scene.input.off("dragend", this.dragEndHandler);
        }

        this.dragHandler = undefined;
        this.dragEndHandler = undefined;
        this.activeSprite?.disableInteractive();
        this.activeSprite = undefined;

        if (!removeVisuals) {
            return;
        }

        if (this.marker) {
            this.scene.tweens.killTweensOf(this.marker);
            this.marker.destroy();
            this.marker = undefined;
        }

        this.instruction?.destroy();
        this.instruction = undefined;
    }

    public cancelMovement(): void {
        this.movementSequence += 1;
        this.cleanupInput();
        this.clearTransientEffects();
        this.landingTimers.forEach(timer => timer.remove(false));
        this.landingTimers.clear();
        if (this.transitionNotice) {
            this.scene.tweens.killTweensOf(this.transitionNotice);
            this.transitionNotice.destroy();
            this.transitionNotice = undefined;
        }
    }

    public destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.cancelMovement();
    }
}

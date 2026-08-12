import Phaser from "phaser";
import { preferencesService } from "../services/PreferencesService";

export interface FeedbackOptions {
    color?: string;
    duration?: number;
    y?: number;
}

/** מרכז יחיד לאנימציות ממשק קצרות ומכבד את הגדרת הפחתת התנועה. */
export class AnimationManager {
    private readonly transientObjects = new Set<Phaser.GameObjects.GameObject>();
    private readonly delayedEvents = new Set<Phaser.Time.TimerEvent>();
    private destroyed = false;

    constructor(private readonly scene: Phaser.Scene) {}

    public pulse(target: Phaser.GameObjects.GameObject, amount = 1.12, duration = 120): void {
        if (this.destroyed || !target.active) return;
        this.scene.tweens.killTweensOf(target);
        if (preferencesService.isReducedMotion()) return;
        this.scene.tweens.add({
            targets: target,
            scaleX: amount,
            scaleY: amount,
            duration,
            yoyo: true,
            ease: "Quad.Out"
        });
    }

    public hover(target: Phaser.GameObjects.GameObject, active: boolean): void {
        if (this.destroyed || !target.active) return;
        this.scene.tweens.killTweensOf(target);
        const scale = active && !preferencesService.isReducedMotion() ? 1.06 : 1;
        this.scene.tweens.add({ targets: target, scaleX: scale, scaleY: scale, duration: 90 });
    }

    public emphasize(target: Phaser.GameObjects.GameObject): void {
        if (this.destroyed || !target.active || preferencesService.isReducedMotion()) return;
        this.scene.tweens.killTweensOf(target);
        this.scene.tweens.add({
            targets: target,
            y: "-=3",
            duration: 420,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut"
        });
    }

    public stop(target: Phaser.GameObjects.GameObject, resetScale = false): void {
        if (this.destroyed) return;
        this.scene.tweens.killTweensOf(target);
        if (resetScale && target instanceof Phaser.GameObjects.Container) {
            target.setScale(1);
        }
    }

    public showFeedback(message: string, options: FeedbackOptions = {}): Phaser.GameObjects.Text {
        const color = options.color ?? "#ffffff";
        const duration = options.duration ?? 1200;
        const y = options.y ?? 150;
        const text = this.scene.add.text(this.scene.cameras.main.centerX, y, message, {
            fontFamily: "Arial",
            fontSize: "29px",
            color,
            fontStyle: "bold",
            stroke: "#071827",
            strokeThickness: 6,
            align: "center",
            rtl: true,
            backgroundColor: "#102f52dd",
            padding: { x: 18, y: 10 }
        }).setOrigin(0.5).setDepth(1800).setScrollFactor(0);

        this.transientObjects.add(text);
        const destroyText = (): void => {
            this.transientObjects.delete(text);
            if (text.active) text.destroy();
        };

        if (preferencesService.isReducedMotion()) {
            const timer = this.scene.time.delayedCall(duration, () => {
                this.delayedEvents.delete(timer);
                destroyText();
            });
            this.delayedEvents.add(timer);
            return text;
        }

        text.setAlpha(0).setScale(0.82);
        this.scene.tweens.add({
            targets: text,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 180,
            ease: "Back.Out",
            yoyo: true,
            hold: duration,
            onComplete: destroyText
        });
        return text;
    }

    public destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.transientObjects.forEach(object => {
            this.scene.tweens.killTweensOf(object);
            if (object.active) object.destroy();
        });
        this.transientObjects.clear();
        this.delayedEvents.forEach(event => event.remove(false));
        this.delayedEvents.clear();
    }
}

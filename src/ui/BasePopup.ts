import Phaser from "phaser";

/**
 * BasePopup
 * --------------------------------------------------
 * מחלקת בסיס לכל החלונות הקופצים במשחק.
 *
 * אחראית על:
 * - שכבת רקע כהה.
 * - פאנל מרכזי.
 * - אנימציות פתיחה וסגירה.
 * - חסימת לחיצות על המשחק שמאחורי החלון.
 * - ניקוי אובייקטים ומאזינים.
 */
export abstract class BasePopup extends Phaser.GameObjects.Container {

    protected readonly overlay: Phaser.GameObjects.Rectangle;
    protected readonly panel: Phaser.GameObjects.Rectangle;

    private opened = false;
    private animating = false;
    private destroyed = false;

    protected constructor(
        scene: Phaser.Scene,
        width = 600,
        height = 400
    ) {
        super(
            scene,
            scene.cameras.main.centerX,
            scene.cameras.main.centerY
        );

        this.overlay = scene.add.rectangle(
            0,
            0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.65
        );

        this.overlay.setInteractive();

        this.panel = scene.add.rectangle(
            0,
            0,
            width,
            height,
            0xffffff
        );

        this.panel.setStrokeStyle(5, 0x1565c0);

        this.add([
            this.overlay,
            this.panel
        ]);

        this.setDepth(2000);
        this.setVisible(false);
        this.setActive(false);
        this.setScrollFactor(0);

        scene.add.existing(this);

        scene.events.once(
            Phaser.Scenes.Events.SHUTDOWN,
            this.handleSceneShutdown,
            this
        );

        scene.events.once(
            Phaser.Scenes.Events.DESTROY,
            this.handleSceneShutdown,
            this
        );
    }

    public open(): void {

        if (this.destroyed || this.opened || this.animating) {
            return;
        }

        this.opened = true;
        this.animating = true;

        this.setVisible(true);
        this.setActive(true);
        this.setAlpha(0);
        this.setScale(0.75);

        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 250,
            ease: "Back.Out",
            onComplete: () => {
                this.animating = false;
            }
        });
    }

    public close(onComplete?: () => void): void {

        if (this.destroyed || !this.opened) {
            return;
        }

        // A very fast click can arrive while the opening tween is still running.
        // Cancel that tween and close normally instead of silently ignoring the request.
        this.scene.tweens.killTweensOf(this);
        this.opened = false;
        this.animating = true;

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0.75,
            scaleY: 0.75,
            duration: 180,
            ease: "Back.In",
            onComplete: () => {
                this.setVisible(false);
                this.setActive(false);
                this.setAlpha(1);
                this.setScale(1);

                this.animating = false;

                onComplete?.();
            }
        });
    }

    public isOpen(): boolean {
        return this.opened;
    }

    public hideImmediately(): void {

        if (this.destroyed) {
            return;
        }

        this.scene.tweens.killTweensOf(this);

        this.opened = false;
        this.animating = false;

        this.setVisible(false);
        this.setActive(false);
        this.setAlpha(1);
        this.setScale(1);
    }

    public destroy(fromScene?: boolean): void {

        if (this.destroyed) {
            return;
        }

        this.destroyed = true;

        if (this.scene) {
            this.scene.tweens.killTweensOf(this);
            this.scene.events.off(
                Phaser.Scenes.Events.SHUTDOWN,
                this.handleSceneShutdown,
                this
            );
            this.scene.events.off(
                Phaser.Scenes.Events.DESTROY,
                this.handleSceneShutdown,
                this
            );
        }

        this.overlay.removeAllListeners();
        this.panel.removeAllListeners();

        super.destroy(fromScene);
    }

    private handleSceneShutdown(): void {
        this.destroy(true);
    }
}

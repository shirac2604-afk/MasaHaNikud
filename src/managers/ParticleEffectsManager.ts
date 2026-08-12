import Phaser from "phaser";

/**
 * מערכת חלקיקים קלה שאינה תלויה בקובצי תמונה חיצוניים.
 * האפקטים נוצרים מאובייקטים גאומטריים ומתנקים אוטומטית בסיום האנימציה.
 */
export class ParticleEffectsManager {
    private readonly active = new Set<Phaser.GameObjects.GameObject>();
    private destroyed = false;

    constructor(private readonly scene: Phaser.Scene) {}

    public celebrate(x = this.scene.scale.width / 2, y = this.scene.scale.height / 2, amount = 22): void {
        if (this.destroyed) return;
        const colors = [0xf5c451, 0x55c878, 0x5fb4e8, 0xf08b65, 0x9b78df];
        for (let index = 0; index < amount; index += 1) {
            const angle = Phaser.Math.FloatBetween(-Math.PI * 0.92, -Math.PI * 0.08);
            const distance = Phaser.Math.Between(90, 220);
            const size = Phaser.Math.Between(5, 10);
            const particle = this.scene.add.star(
                x,
                y,
                5,
                Math.max(2, size * 0.42),
                size,
                Phaser.Utils.Array.GetRandom(colors),
                1
            ).setDepth(2400).setScrollFactor(0).setAngle(Phaser.Math.Between(0, 360));
            this.active.add(particle);
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance + Phaser.Math.Between(-25, 35),
                angle: particle.angle + Phaser.Math.Between(120, 420),
                alpha: 0,
                scale: 0.45,
                duration: Phaser.Math.Between(650, 950),
                ease: "Cubic.Out",
                onComplete: () => this.release(particle)
            });
        }
    }

    public encourage(x = this.scene.scale.width / 2, y = this.scene.scale.height / 2): void {
        if (this.destroyed) return;
        for (let index = 0; index < 10; index += 1) {
            const angle = (Math.PI * 2 * index) / 10;
            const particle = this.scene.add.circle(x, y, Phaser.Math.Between(3, 6), 0xf2b93b, 0.85)
                .setDepth(2400)
                .setScrollFactor(0);
            this.active.add(particle);
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * Phaser.Math.Between(48, 78),
                y: y + Math.sin(angle) * Phaser.Math.Between(30, 55),
                alpha: 0,
                scale: 0.25,
                duration: 430,
                ease: "Quad.Out",
                onComplete: () => this.release(particle)
            });
        }
    }

    public destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.active.forEach(particle => {
            this.scene.tweens.killTweensOf(particle);
            particle.destroy();
        });
        this.active.clear();
    }

    private release(particle: Phaser.GameObjects.GameObject): void {
        this.active.delete(particle);
        particle.destroy();
    }
}

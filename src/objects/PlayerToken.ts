import Phaser from "phaser";

/** חייל שחקן עם עיגון בכפות הרגליים, צל והבלטה מעל הלוח. */
export class PlayerToken {
    private readonly sprite: Phaser.GameObjects.Image;
    private readonly shadow: Phaser.GameObjects.Ellipse;
    private currentTile = 1;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        private readonly slotOffsetX = 0,
        private readonly slotOffsetY = 0
    ) {
        const position = this.getBoardPosition(x, y);

        this.shadow = scene.add.ellipse(
            position.x,
            position.y - 2,
            42,
            14,
            0x000000,
            0.34
        ).setDepth(90 + Math.round(position.y));

        this.sprite = scene.add.image(position.x, position.y, texture)
            .setOrigin(0.5, 0.9)
            .setDisplaySize(62, 92)
            .setDepth(100 + Math.round(position.y));
    }

    public getBoardPosition(tileX: number, tileY: number): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(
            tileX + this.slotOffsetX,
            tileY + 18 + this.slotOffsetY
        );
    }

    public snapToTile(tileX: number, tileY: number): void {
        const position = this.getBoardPosition(tileX, tileY);
        this.sprite.setPosition(position.x, position.y);
        this.shadow.setPosition(position.x, position.y - 2);
        this.updateDepth(position.y);
    }

    public moveTo(
        scene: Phaser.Scene,
        tileX: number,
        tileY: number,
        onComplete?: () => void
    ): void {
        const position = this.getBoardPosition(tileX, tileY);

        scene.tweens.add({
            targets: [this.sprite, this.shadow],
            x: position.x,
            y: (_target: Phaser.GameObjects.GameObject, _key: string, _value: number, index: number) =>
                index === 0 ? position.y : position.y - 2,
            duration: 170,
            ease: "Sine.easeInOut",
            onComplete: () => {
                this.updateDepth(position.y);
                onComplete?.();
            }
        });
    }


    public setDraggedPosition(x: number, y: number): void {
        this.sprite.setPosition(x, y);
        this.shadow.setPosition(x, y - 2);
    }

    public animateToPosition(
        scene: Phaser.Scene,
        x: number,
        y: number,
        duration = 170,
        onComplete?: () => void,
        ease = "Sine.easeInOut"
    ): void {
        scene.tweens.add({
            targets: this.sprite,
            x,
            y,
            duration,
            ease,
            onUpdate: () => {
                this.shadow.setPosition(this.sprite.x, this.sprite.y - 2);
            },
            onComplete: () => {
                this.shadow.setPosition(x, y - 2);
                this.updateDepth(y);
                onComplete?.();
            }
        });
    }

    public setTile(tile: number): void { this.currentTile = tile; }
    public getTile(): number { return this.currentTile; }
    public getSprite(): Phaser.GameObjects.Image { return this.sprite; }
    public setTexture(texture: string): void {
        this.sprite.setTexture(texture).setDisplaySize(62, 92);
    }

    public setActive(scene: Phaser.Scene, active: boolean): void {
        // גודל החייל נשאר קבוע לחלוטין. הדגשת התור נעשית בגוון ובצל בלבד.
        scene.tweens.killTweensOf(this.sprite);
        this.sprite.setDisplaySize(62, 92).setAlpha(1);

        if (!active) {
            this.sprite.clearTint();
            this.shadow.setFillStyle(0x000000, 0.34);
            return;
        }

        this.sprite.setTint(0xfff4be);
        this.shadow.setFillStyle(0xf4c542, 0.48);
    }

    public celebrateLanding(scene: Phaser.Scene): void {
        scene.tweens.add({
            targets: this.sprite,
            y: this.sprite.y - 16,
            duration: 120,
            yoyo: true,
            ease: "Quad.Out",
            onUpdate: () => this.shadow.setPosition(this.sprite.x, this.sprite.y - 2),
            onComplete: () => this.shadow.setPosition(this.sprite.x, this.sprite.y - 2)
        });
    }

    public destroy(): void {
        const scene = this.sprite.scene;
        scene?.tweens.killTweensOf(this.sprite);
        scene?.tweens.killTweensOf(this.shadow);
        this.sprite.removeAllListeners();
        this.shadow.removeAllListeners();
        this.shadow.destroy();
        this.sprite.destroy();
    }

    private updateDepth(y: number): void {
        this.shadow.setDepth(90 + Math.round(y));
        this.sprite.setDepth(100 + Math.round(y));
    }
}

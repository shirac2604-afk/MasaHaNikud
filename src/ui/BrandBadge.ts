import Phaser from "phaser";
import { AssetKeys } from "../core/AssetKeys";
import { Colors } from "../theme/Colors";

export interface BrandBadgeOptions {
    x: number;
    y: number;
    diameter?: number;
    depth?: number;
    frameless?: boolean;
}

/**
 * A clean circular brand badge that always displays the entire square logo.
 * The logo is fitted inside the circle without clipping or stretching.
 */
export class BrandBadge extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, options: BrandBadgeOptions) {
        super(scene, options.x, options.y);
        scene.add.existing(this);

        const diameter = options.diameter ?? 148;
        const radius = diameter / 2;
        const innerDiameter = diameter - 18;

        this.setDepth(options.depth ?? 120);

        const shadow = scene.add.circle(3, 5, radius, 0x000000, options.frameless ? 0.18 : 0.24);
        const outerRing = scene.add.circle(0, 0, radius, Colors.gold, options.frameless ? 0 : 1);
        const innerPlate = scene.add.circle(0, 0, radius - 3, 0xffffff, options.frameless ? 0 : 1);
        const softRing = scene.add.circle(0, 0, radius - 8, 0xf5fbff, options.frameless ? 0 : 1)
            .setStrokeStyle(options.frameless ? 0 : 2, Colors.border, options.frameless ? 0 : 0.55);

        const logoKey = options.frameless ? AssetKeys.Brand.LOGO : AssetKeys.Brand.LOGO_ORIGINAL;
        const logo = scene.add.image(0, 0, logoKey).setOrigin(0.5);

        const source = scene.textures.get(logoKey).getSourceImage() as HTMLImageElement;
        const sourceWidth = Math.max(1, source.width);
        const sourceHeight = Math.max(1, source.height);
        const fitScale = Math.min(innerDiameter / sourceWidth, innerDiameter / sourceHeight);
        logo.setScale(fitScale);

        if (options.frameless) {
            // logo-circle.png already has transparent circular edges.
            this.add(logo);
        } else {
            this.add([shadow, outerRing, innerPlate, softRing, logo]);
        }
    }
}

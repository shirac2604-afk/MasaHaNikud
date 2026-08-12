import Phaser from "phaser";
import { AssetKeys } from "../core/AssetKeys";
import { resolvePublicAssetUrl } from "./AssetUrl";

export class BrandLoader {
    public static load(scene: Phaser.Scene): void {
        scene.load.image(AssetKeys.Brand.LOGO, resolvePublicAssetUrl("assets/branding/logo-circle.png"));
        scene.load.image(AssetKeys.Brand.LOGO_ORIGINAL, resolvePublicAssetUrl("assets/branding/logo-original.png"));
    }
}

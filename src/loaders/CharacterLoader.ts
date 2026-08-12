import Phaser from "phaser";
import { AssetKeys } from "../core/AssetKeys";
import { resolvePublicAssetUrl } from "./AssetUrl";

export class CharacterLoader {
    public static load(scene: Phaser.Scene): void {
        scene.load.image(AssetKeys.Characters.SOLDIER_BLUE, resolvePublicAssetUrl("assets/characters/soldier-blue.png"));
        scene.load.image(AssetKeys.Characters.SOLDIER_GREEN, resolvePublicAssetUrl("assets/characters/soldier-green.png"));
        scene.load.image(AssetKeys.Characters.SOLDIER_RED, resolvePublicAssetUrl("assets/characters/soldier-red.png"));
        scene.load.image(AssetKeys.Characters.SOLDIER_YELLOW, resolvePublicAssetUrl("assets/characters/soldier-yellow.png"));
        scene.load.image(AssetKeys.Characters.SOLDIER_PURPLE, resolvePublicAssetUrl("assets/characters/soldier-purple.png"));
        scene.load.image(AssetKeys.Characters.SOLDIER_BROWN, resolvePublicAssetUrl("assets/characters/soldier-brown.png"));
    }
}

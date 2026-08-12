import Phaser from "phaser";
import { AssetKeys } from "../core/AssetKeys";

export class BackgroundLoader {

    public static load(scene: Phaser.Scene): void {

        scene.load.image(
            AssetKeys.Backgrounds.MENU,
            "assets/backgrounds/menu.png"
        );

        scene.load.image(
            AssetKeys.Backgrounds.GAME,
            "assets/backgrounds/game.png"
        );

    }

}
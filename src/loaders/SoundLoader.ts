import Phaser from "phaser";
import { AssetKeys } from "../core/AssetKeys";

export class SoundLoader {

    public static load(scene: Phaser.Scene): void {

        scene.load.audio(
            AssetKeys.Sounds.CLICK,
            "assets/sounds/click.mp3"
        );

        scene.load.audio(
            AssetKeys.Sounds.DICE,
            "assets/sounds/dice.mp3"
        );

        scene.load.audio(
            AssetKeys.Sounds.CORRECT,
            "assets/sounds/correct.mp3"
        );

        scene.load.audio(
            AssetKeys.Sounds.WRONG,
            "assets/sounds/wrong.mp3"
        );

        scene.load.audio(
            AssetKeys.Sounds.WIN,
            "assets/sounds/win.mp3"
        );

    }

}
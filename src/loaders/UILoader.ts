import Phaser from "phaser";
import { AssetKeys } from "../core/AssetKeys";

export class UILoader {

    public static load(scene: Phaser.Scene): void {

        scene.load.image(
            AssetKeys.Dice.IMAGE,
            "assets/ui/dice.png"
        );

        scene.load.image(
            AssetKeys.Icons.STAR,
            "assets/icons/star.png"
        );

        scene.load.image(
            AssetKeys.Icons.QUESTION,
            "assets/icons/question.png"
        );

        scene.load.image(
            AssetKeys.Icons.BONUS,
            "assets/icons/bonus.png"
        );

        scene.load.image(
            AssetKeys.Icons.FINISH,
            "assets/icons/finish.png"
        );

    }

}
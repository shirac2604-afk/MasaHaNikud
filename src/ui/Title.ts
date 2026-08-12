import Phaser from "phaser";

import { Theme } from "../theme/Theme";

export class Title {

    constructor(

        scene: Phaser.Scene,

        text: string

    ){

        scene.add.text(

            scene.scale.width/2,

            80,

            text,

            Theme.fonts.title

        ).setOrigin(.5);

    }

}
import Phaser from "phaser";

export class Panel {

    constructor(

        scene: Phaser.Scene,

        x: number,

        y: number,

        width: number,

        height: number

    ) {

        const panel = scene.add.rectangle(

            x,

            y,

            width,

            height,

            0xffffff

        );

        panel.setStrokeStyle(4,0x1976D2);

        panel.setAlpha(.95);

    }

}
import Phaser from "phaser";

export class Dialog {

    constructor(

        scene: Phaser.Scene,

        title: string,

        message: string

    ){

        scene.add.rectangle(

            640,

            360,

            600,

            350,

            0xffffff

        ).setStrokeStyle(5,0x1976D2);

        scene.add.text(

            640,

            250,

            title,

            {

                fontSize:"40px",

                color:"#000"

            }

        ).setOrigin(.5);

        scene.add.text(

            640,

            360,

            message,

            {

                fontSize:"26px",

                color:"#333",

                align:"center"

            }

        ).setOrigin(.5);

    }

}
import Phaser from "phaser";

export class Button {

    private button: Phaser.GameObjects.Container;

    constructor(

        scene: Phaser.Scene,

        x: number,

        y: number,

        text: string,

        callback: () => void

    ) {

        const background = scene.add.rectangle(

            0,

            0,

            300,

            60,

            0x1976D2

        );

        background.setStrokeStyle(3,0xffffff);

        const label = scene.add.text(

            0,

            0,

            text,

            {

                fontFamily:"Arial",

                fontSize:"28px",

                color:"#ffffff"

            }

        ).setOrigin(.5);

        this.button = scene.add.container(

            x,

            y,

            [

                background,

                label

            ]

        );

        background.setInteractive();

        background.on("pointerover",()=>{

            this.button.setScale(1.05);

        });

        background.on("pointerout",()=>{

            this.button.setScale(1);

        });

        background.on("pointerdown",callback);

    }

}
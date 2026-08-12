import Phaser from "phaser";

import { Tile } from "../models/Tile";

export class BoardTile {

    private container: Phaser.GameObjects.Container;

    constructor(

        private scene: Phaser.Scene,

        private tile: Tile

    ) {

        this.container = this.scene.add.container(

            tile.x,

            tile.y

        );

        this.create();

    }

    private create(): void {

        let color = 0xffffff;
        let icon = "";

        switch (this.tile.type) {

            case "start":
                color = 0x4CAF50;
                icon = "▶";
                break;

            case "question":
                color = 0xFFEB3B;
                icon = "?";
                break;

            case "bonus":
                color = 0x29B6F6;
                icon = "★";
                break;

            case "finish":
                color = 0xE53935;
                icon = "🏆";
                break;

            default:
                color = 0xF5F5F5;
                icon = "";
                break;

        }

        const background = this.scene.add.rectangle(

            0,

            0,

            80,

            80,

            color

        );

        background.setStrokeStyle(

            3,

            0x333333

        );

        background.setRounded?.(10);

        const number = this.scene.add.text(

            -28,

            -30,

            this.tile.id.toString(),

            {

                fontFamily: "Arial",

                fontSize: "18px",

                color: "#000000",

                fontStyle: "bold"

            }

        );

        const iconText = this.scene.add.text(

            0,

            5,

            icon,

            {

                fontFamily: "Arial",

                fontSize: "28px",

                color: "#000000"

            }

        ).setOrigin(0.5);

        this.container.add(background);

        this.container.add(number);

        this.container.add(iconText);

    }

    public getContainer(): Phaser.GameObjects.Container {

        return this.container;

    }

}
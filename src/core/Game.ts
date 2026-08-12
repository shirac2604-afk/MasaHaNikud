import Phaser from "phaser";

import { GameConfig } from "./GameConfig";

import { BootScene } from "../scenes/BootScene";
import { MenuScene } from "../scenes/MenuScene";
import { SettingsScene } from "../scenes/SettingsScene";
import { PlayerSetupScene } from "../scenes/PlayerSetupScene";
import { CharacterSelectScene } from "../scenes/CharacterSelectScene";
import { BoardSelectScene } from "../scenes/BoardSelectScene";
import { GameScene } from "../scenes/GameScene";

export class Game {

    private game: Phaser.Game;

    constructor() {

        this.game = new Phaser.Game({

            type: Phaser.AUTO,

            width: GameConfig.WIDTH,

            height: GameConfig.HEIGHT,

            parent: "game",

            backgroundColor: "#7EC8E3",

            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: GameConfig.WIDTH,
                height: GameConfig.HEIGHT,
                fullscreenTarget: "game"
            },

            scene: [

                BootScene,

                MenuScene,

                SettingsScene,


                PlayerSetupScene,

                CharacterSelectScene,

                BoardSelectScene,

                GameScene

            ],

            physics: {

                default: "arcade",

                arcade: {

                    debug: false

                }

            }

        });

    }

}
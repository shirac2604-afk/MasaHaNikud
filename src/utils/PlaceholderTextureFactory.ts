import Phaser from "phaser";

import { AssetKeys } from "../core/AssetKeys";

export class PlaceholderTextureFactory {

    public static create(scene: Phaser.Scene): void {

        this.createTiles(scene);

        this.createCharacters(scene);

        this.createDice(scene);

        this.createUI(scene);

    }

    // ============================
    // Tiles
    // ============================

    private static createTiles(scene: Phaser.Scene): void {

        this.createTile(scene, AssetKeys.Tiles.NORMAL, 0xffffff);

        this.createTile(scene, AssetKeys.Tiles.START, 0x4CAF50);

        this.createTile(scene, AssetKeys.Tiles.QUESTION, 0xFFEB3B);

        this.createTile(scene, AssetKeys.Tiles.BONUS, 0x29B6F6);

        this.createTile(scene, AssetKeys.Tiles.FINISH, 0xE53935);

    }

    private static createTile(

        scene: Phaser.Scene,

        key: string,

        color: number

    ): void {

        if (scene.textures.exists(key)) {

            return;

        }

        const graphics = scene.make.graphics({

            x: 0,

            y: 0

        });

        graphics.fillStyle(color);

        graphics.fillRoundedRect(

            0,

            0,

            90,

            90,

            12

        );

        graphics.lineStyle(

            4,

            0x333333

        );

        graphics.strokeRoundedRect(

            0,

            0,

            90,

            90,

            12

        );

        graphics.generateTexture(

            key,

            90,

            90

        );

        graphics.destroy();

    }

    // ============================
    // Characters
    // ============================

    private static createCharacters(scene: Phaser.Scene): void {

        const characters = [

            AssetKeys.Characters.LION,

            AssetKeys.Characters.ELEPHANT,

            AssetKeys.Characters.GIRAFFE,

            AssetKeys.Characters.MONKEY,

            AssetKeys.Characters.DOG,

            AssetKeys.Characters.CAT,

            AssetKeys.Characters.BEAR,

            AssetKeys.Characters.RABBIT,

            AssetKeys.Characters.FOX,

            AssetKeys.Characters.TURTLE,

            AssetKeys.Characters.PARROT,

            AssetKeys.Characters.PANDA

        ];

        const colors = [

            0xff4444,

            0x4488ff,

            0x44cc44,

            0xffcc00,

            0xff66cc,

            0x00cccc,

            0xff8800,

            0xaa66ff,

            0x795548,

            0x009688,

            0x8bc34a,

            0x607d8b

        ];

        characters.forEach((key, index) => {

            if (scene.textures.exists(key)) {

                return;

            }

            const graphics = scene.make.graphics({

                x: 0,

                y: 0

            });

            graphics.fillStyle(colors[index]);

            graphics.fillCircle(

                30,

                30,

                30

            );

            graphics.lineStyle(

                4,

                0xffffff

            );

            graphics.strokeCircle(

                30,

                30,

                30

            );

            graphics.generateTexture(

                key,

                60,

                60

            );

            graphics.destroy();

        });

    }

    // ============================
    // Dice
    // ============================

    private static createDice(scene: Phaser.Scene): void {

        if (scene.textures.exists(AssetKeys.Dice.BUTTON)) {

            return;

        }

        const graphics = scene.make.graphics({

            x: 0,

            y: 0

        });

        graphics.fillStyle(0xffffff);

        graphics.fillRoundedRect(

            0,

            0,

            80,

            80,

            15

        );

        graphics.lineStyle(

            5,

            0x222222

        );

        graphics.strokeRoundedRect(

            0,

            0,

            80,

            80,

            15

        );

        graphics.generateTexture(

            AssetKeys.Dice.BUTTON,

            80,

            80

        );

        graphics.destroy();

    }

    // ============================
    // UI
    // ============================

    private static createUI(scene: Phaser.Scene): void {

        if (!scene.textures.exists(AssetKeys.UI.BUTTON)) {

            const graphics = scene.make.graphics({

                x: 0,

                y: 0

            });

            graphics.fillStyle(0x1976D2);

            graphics.fillRoundedRect(

                0,

                0,

                250,

                60,

                10

            );

            graphics.generateTexture(

                AssetKeys.UI.BUTTON,

                250,

                60

            );

            graphics.destroy();

        }

        if (!scene.textures.exists(AssetKeys.UI.PANEL)) {

            const graphics = scene.make.graphics({

                x: 0,

                y: 0

            });

            graphics.fillStyle(

                0xffffff,

                0.95

            );

            graphics.fillRoundedRect(

                0,

                0,

                700,

                500,

                16

            );

            graphics.lineStyle(

                5,

                0x1565C0

            );

            graphics.strokeRoundedRect(

                0,

                0,

                700,

                500,

                16

            );

            graphics.generateTexture(

                AssetKeys.UI.PANEL,

                700,

                500

            );

            graphics.destroy();

        }

    }

}
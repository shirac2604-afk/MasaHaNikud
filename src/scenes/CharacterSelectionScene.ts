import Phaser from "phaser";

import { BaseScene } from "../core/BaseScene";
import { SceneKeys } from "../core/SceneKeys";

import { Characters } from "../data/Characters";
import { Character } from "../models/Character";

import { gameState } from "../services/GameState";

export class CharacterSelectionScene extends BaseScene {

    private currentPlayer = 0;

    private title!: Phaser.GameObjects.Text;

    private selected = new Set<number>();

    constructor() {

        super(SceneKeys.CHARACTER_SELECTION);

    }

    create(): void {

        this.setBackground();

        this.title = this.add.text(

            640,

            60,

            "",

            {

                fontFamily: "Arial",

                fontSize: "40px",

                color: "#ffffff",

                fontStyle: "bold"

            }

        ).setOrigin(.5);

        this.updateTitle();

        this.createCharacters();

    }

    private updateTitle(): void {

        this.title.setText(

            `שחקן ${this.currentPlayer + 1} - בחר דמות`

        );

    }

    private createCharacters(): void {

        const cols = 4;

        const startX = 250;

        const startY = 170;

        const gapX = 180;

        const gapY = 170;

        Characters.forEach((character, index) => {

            const col = index % cols;

            const row = Math.floor(index / cols);

            const x = startX + col * gapX;

            const y = startY + row * gapY;

            const frame = this.add.rectangle(

                x,

                y,

                100,

                100,

                0xffffff,

                0.15

            );

            frame.setStrokeStyle(

                3,

                0xffffff

            );

            const image = this.add.image(

                x,

                y,

                character.texture

            );

            image.setDisplaySize(

                72,

                72

            );

            image.setInteractive({

                useHandCursor: true

            });

            const name = this.add.text(

                x,

                y + 72,

                character.name,

                {

                    fontFamily: "Arial",

                    fontSize: "20px",

                    color: "#ffffff"

                }

            ).setOrigin(.5);

            image.on("pointerover", () => {

                if (this.selected.has(character.id)) {

                    return;

                }

                image.setScale(1.15);

                frame.setStrokeStyle(

                    4,

                    0xffeb3b

                );

            });

            image.on("pointerout", () => {

                if (this.selected.has(character.id)) {

                    return;

                }

                image.setScale(1);

                frame.setStrokeStyle(

                    3,

                    0xffffff

                );

            });

            image.on("pointerdown", () => {

                this.selectCharacter(

                    character,

                    image,

                    frame,

                    name

                );

            });

        });

    }

    private selectCharacter(

        character: Character,

        image: Phaser.GameObjects.Image,

        frame: Phaser.GameObjects.Rectangle,

        name: Phaser.GameObjects.Text

    ): void {

        if (this.selected.has(character.id)) {

            return;

        }

        this.selected.add(character.id);

        gameState.setPlayerCharacter(

            this.currentPlayer,

            character.texture

        );

        image.disableInteractive();

        image.setTint(0x66ff66);

        frame.setFillStyle(

            0x4CAF50,

            0.35

        );

        frame.setStrokeStyle(

            4,

            0x4CAF50

        );

        name.setColor("#66ff66");

        this.currentPlayer++;

        if (

            this.currentPlayer >= gameState.getPlayerCount()

        ) {

            this.scene.start(

                SceneKeys.GAME

            );

            return;

        }

        this.updateTitle();

    }

}
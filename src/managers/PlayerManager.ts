import Phaser from "phaser";

import { Characters } from "../data/Characters";
import { PlayerToken } from "../objects/PlayerToken";
import { BoardService } from "../services/BoardService";
import { gameState } from "../services/GameState";

/**
 * מיקומי חיילים סביב מרכז אותה משבצת.
 * כך כמה שחקנים יכולים לעמוד יחד בלי להסתיר זה את זה.
 */
const TOKEN_SLOTS: ReadonlyArray<Readonly<[number, number]>> = [
    [-18, -4],
    [18, -4],
    [-22, 12],
    [22, 12],
    [-9, 22],
    [9, 22]
];

export class PlayerManager {
    private tokens: PlayerToken[] = [];

    constructor(
        private readonly scene: Phaser.Scene,
        private readonly board: BoardService
    ) {}

    public createPlayers(): void {
        const startTile = this.board.getStartTile();

        gameState.getPlayers().forEach((_player, index) => {
            const texture =
                gameState.getPlayerCharacter(index) ||
                Characters[index % Characters.length].texture;

            const slot = TOKEN_SLOTS[index % TOKEN_SLOTS.length];

            this.tokens.push(
                new PlayerToken(
                    this.scene,
                    startTile.x,
                    startTile.y,
                    texture,
                    slot[0],
                    slot[1]
                )
            );
        });
    }

    public getPlayer(index: number): PlayerToken {
        return this.tokens[index];
    }

    public getPlayers(): PlayerToken[] {
        return this.tokens;
    }

    public setActivePlayer(playerIndex: number): void {
        this.tokens.forEach((token, index) => token.setActive(this.scene, index === playerIndex));
    }

    public destroy(): void {
        this.tokens.forEach(token => token.destroy());
        this.tokens = [];
    }
}

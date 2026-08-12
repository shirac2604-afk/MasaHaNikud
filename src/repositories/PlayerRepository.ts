import { Player } from "../models/Player";

export class PlayerRepository {

    private players: Player[] = [];

    public create(count: number): void {

        this.players = [];

        for (let i = 0; i < count; i++) {

            this.players.push({

                id: i,

                name: `שחקן ${i + 1}`,

                characterId: "",

                tile: 0,

                currentTile: 0,

                score: 0,

                skips: 0,

                finished: false

            });

        }

    }

    public getAll(): Player[] {

        return this.players;

    }

    public get(index: number): Player {

        return this.players[index];

    }

    public updateTile(

        playerId: number,

        tile: number

    ): void {

        this.players[playerId].currentTile = tile;

    }

    public addScore(

        playerId: number,

        score: number

    ): void {

        this.players[playerId].score += score;

    }

}
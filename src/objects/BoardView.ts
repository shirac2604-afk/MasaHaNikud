import Phaser from "phaser";
import { Tile } from "../models/Tile";
import { BoardTile } from "./BoardTile";

export class BoardView {

    private readonly scene: Phaser.Scene;

    private readonly boardTiles: BoardTile[] = [];

    constructor(scene: Phaser.Scene) {

        this.scene = scene;

    }

    public create(tiles: Tile[]): void {

        this.clear();

        tiles.forEach(tile => {

            const boardTile = new BoardTile(

                this.scene,

                tile

            );

            this.boardTiles.push(boardTile);

        });

    }

    public clear(): void {

        this.boardTiles.forEach(tile => {

            tile.getContainer().destroy(true);

        });

        this.boardTiles.length = 0;

    }

    public getTile(index: number): BoardTile | undefined {

        return this.boardTiles[index];

    }

    public getTiles(): BoardTile[] {

        return this.boardTiles;

    }

}
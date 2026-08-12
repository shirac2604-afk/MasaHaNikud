export type TileType =
    | "start"
    | "normal"
    | "question"
    | "bonus"
    | "finish";

export interface Tile {
    id: number;

    /** Player-foot anchor in scene coordinates. */
    x: number;
    y: number;

    /** Visual center of the tile in scene coordinates. */
    centerX: number;
    centerY: number;

    type: TileType;
    questionGroup: string;
    label?: string;
}

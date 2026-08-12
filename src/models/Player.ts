export interface Player {

    id: number;

    name: string;

    characterId: string;

    tile: number;

    currentTile?: number;

    score: number;

    skips: number;

    finished?: boolean;

}

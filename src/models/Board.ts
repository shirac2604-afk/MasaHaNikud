import { Tile } from "./Tile";

export interface Board {

    id: string;

    name: string;

    description: string;

    assetKey: string;

    tiles?: Tile[];

    layout?: string;

    questions?: string;

    difficulty?: number;

    recommendedAge?: string;

}

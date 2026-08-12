import { AssetKeys } from "../core/AssetKeys";
import { Character } from "../models/Character";

export const Characters: Character[] = [
    { id: 1, name: "חייל כחול", texture: AssetKeys.Characters.SOLDIER_BLUE },
    { id: 2, name: "חייל ירוק", texture: AssetKeys.Characters.SOLDIER_GREEN },
    { id: 3, name: "חייל אדום", texture: AssetKeys.Characters.SOLDIER_RED },
    { id: 4, name: "חייל צהוב", texture: AssetKeys.Characters.SOLDIER_YELLOW },
    { id: 5, name: "חייל סגול", texture: AssetKeys.Characters.SOLDIER_PURPLE },
    { id: 6, name: "חייל חום", texture: AssetKeys.Characters.SOLDIER_BROWN }
];

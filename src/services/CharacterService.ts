import { Character } from "../models";
import { AssetKeys } from "../core/AssetKeys";

export class CharacterService {

    private readonly characters: Character[] = [

        {
            id: 1,
            name: "אריה",
            texture: AssetKeys.Characters.LION
        },

        {
            id: 2,
            name: "פיל",
            texture: AssetKeys.Characters.ELEPHANT
        },

        {
            id: 3,
            name: "ג'ירפה",
            texture: AssetKeys.Characters.GIRAFFE
        },

        {
            id: 4,
            name: "קוף",
            texture: AssetKeys.Characters.MONKEY
        }

    ];

    public getAll(): Character[] {

        return this.characters;

    }

    public get(id: number): Character | undefined {

        return this.characters.find(
            c => c.id === id
        );

    }

}
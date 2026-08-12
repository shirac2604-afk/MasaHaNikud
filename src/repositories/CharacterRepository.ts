import { Characters } from "../data/Characters";
import { Character } from "../models/Character";

export class CharacterRepository {

    private characters: Character[];

    constructor() {

        this.characters = Characters.map(character => ({

            ...character

        }));

    }

    public getAll(): Character[] {

        return this.characters;

    }

    public getById(id: number): Character | undefined {

        return this.characters.find(

            character => character.id === id

        );

    }

    public isSelected(id: number): boolean {

        const character = this.getById(id);

        return character?.selected ?? false;

    }

    public select(id: number): boolean {

        const character = this.getById(id);

        if (!character) {

            return false;

        }

        if (character.selected) {

            return false;

        }

        character.selected = true;

        return true;

    }

    public unselect(id: number): void {

        const character = this.getById(id);

        if (!character) {

            return;

        }

        character.selected = false;

    }

    public reset(): void {

        this.characters.forEach(character => {

            character.selected = false;

        });

    }

}
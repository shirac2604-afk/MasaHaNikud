import { Bonus } from "../models/Bonus";
import { bonuses } from "../data/bonuses";

/**
 * BonusService
 * ------------------------
 * אחראי על טעינה ושליפה של בונוסים.
 */
export class BonusService {

    /**
     * מחזיר את כל הבונוסים.
     */
    public getAll(): Bonus[] {

        return bonuses;

    }

    /**
     * מחזיר בונוס אקראי.
     */
    public getRandom(): Bonus {

        const index = Math.floor(Math.random() * bonuses.length);

        return bonuses[index];

    }

    /**
     * מחזיר בונוס לפי מזהה.
     */
    public getById(id: string): Bonus | undefined {

        return bonuses.find(

            bonus => bonus.id === id

        );

    }

}
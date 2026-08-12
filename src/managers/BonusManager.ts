import Phaser from "phaser";

import { Bonus } from "../models/Bonus";
import { BonusService } from "../services/BonusService";

/**
 * BonusManager
 * ------------------------
 * אחראי על בחירת בונוס והפעלתו.
 *
 * בשלב הראשון הוא רק מחזיר את הבונוס שנבחר.
 * בהמשך הוא יהיה אחראי גם על ביצוע הפעולות.
 */
export class BonusManager {

    private readonly service: BonusService;

    constructor(
        private scene: Phaser.Scene
    ) {

        this.service = new BonusService();

    }

    /**
     * אתחול
     */
    public create(): void {

    }

    /**
     * מחזיר בונוס אקראי.
     */
    public getRandomBonus(): Bonus {

        return this.service.getRandom();

    }

    /**
     * מחזיר בונוס לפי מזהה.
     */
    public getBonus(id: string): Bonus | undefined {

        return this.service.getById(id);

    }

    /**
     * מפעיל בונוס.
     *
     * כרגע רק מחזיר את הבונוס.
     * בספרינט הבא נוסיף את הלוגיקה.
     */
    public execute(bonus: Bonus): Bonus {

        return bonus;

    }

    /**
     * ניקוי
     */
    public destroy(): void {

    }

}
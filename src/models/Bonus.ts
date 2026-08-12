/**
 * Bonus
 * ------------------------
 * מייצג בונוס שניתן להפעיל כאשר שחקן נוחת
 * על משבצת מסוג "bonus".
 */
export interface Bonus {

    /**
     * מזהה ייחודי של הבונוס
     */
    id: string;

    /**
     * שם הבונוס
     */
    title: string;

    /**
     * תיאור קצר שיוצג לשחקן
     */
    description: string;

    /**
     * סוג הפעולה
     */
    action:
        | "addPoints"
        | "moveForward"
        | "moveBackward"
        | "extraTurn"
        | "skipTurn"
        | "rollAgain";

    /**
     * ערך הבונוס (נקודות / צעדים)
     */
    value?: number;

}
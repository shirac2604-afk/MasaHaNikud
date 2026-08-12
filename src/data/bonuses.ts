import { Bonus } from "../models/Bonus";

/**
 * כל הבונוסים במשחק
 */
export const bonuses: Bonus[] = [

    {
        id: "points20",
        title: "⭐ בונוס ניקוד",
        description: "קיבלת 20 נקודות!",
        action: "addPoints",
        value: 20
    },

    {
        id: "forward3",
        title: "🚀 התקדם",
        description: "התקדם 3 משבצות.",
        action: "moveForward",
        value: 3
    },

    {
        id: "back2",
        title: "🐢 חזור",
        description: "חזור 2 משבצות.",
        action: "moveBackward",
        value: 2
    },

    {
        id: "extraTurn",
        title: "🎲 תור נוסף",
        description: "קיבלת תור נוסף!",
        action: "extraTurn"
    },

    {
        id: "rollAgain",
        title: "🎲 זרוק שוב",
        description: "אפשר לזרוק שוב את הקובייה.",
        action: "rollAgain"
    }

];
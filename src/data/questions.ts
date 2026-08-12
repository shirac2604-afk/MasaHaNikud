import { Question } from "../models/Question";

export const Questions: Question[] = [

    {

        id: 1,

        text: "איזה ניקוד יש במילה אָב?",

        answers: [

            { id: 1, text: "קמץ" },

            { id: 2, text: "פתח" },

            { id: 3, text: "חולם" },

            { id: 4, text: "שורוק" }

        ],

        correctAnswer: 1,

        difficulty: 1

    },

    {

        id: 2,

        text: "איזה ניקוד יש במילה בֵּן?",

        answers: [

            { id: 1, text: "סגול" },

            { id: 2, text: "צירה" },

            { id: 3, text: "חיריק" },

            { id: 4, text: "קובוץ" }

        ],

        correctAnswer: 2,

        difficulty: 1

    },

    {

        id: 3,

        text: "איזה ניקוד יש במילה סוּס?",

        answers: [

            { id: 1, text: "שורוק" },

            { id: 2, text: "קמץ" },

            { id: 3, text: "פתח" },

            { id: 4, text: "חולם" }

        ],

        correctAnswer: 1,

        difficulty: 1

    },

    {

        id: 4,

        text: "איזה ניקוד יש במילה כֹּל?",

        answers: [

            { id: 1, text: "חולם חסר" },

            { id: 2, text: "קמץ" },

            { id: 3, text: "צירה" },

            { id: 4, text: "פתח" }

        ],

        correctAnswer: 1,

        difficulty: 1

    }

];
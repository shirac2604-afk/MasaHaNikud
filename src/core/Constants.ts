export const GameConfig = {

    // גודל חלון המשחק
    WIDTH: 1280,

    HEIGHT: 720,

    // הלוח
    BOARD: {

        ROWS: 5,

        COLUMNS: 6,

        TILE_SIZE: 90,

        START_X: 415,

        START_Y: 140

    },

    // שחקנים
    PLAYERS: {

        MAX: 4,

        COLORS: [

            0xff4444, // אדום

            0x4488ff, // כחול

            0x44cc44, // ירוק

            0xffcc00  // צהוב

        ]

    },

    // קובייה
    DICE: {

        X: 1160,

        Y: 110

    },

    // ממשק
    UI: {

        HEADER_HEIGHT: 70

    },

    // אנימציות
    ANIMATION: {

        MOVE_DURATION: 250,

        BUTTON_DURATION: 120

    }

} as const;
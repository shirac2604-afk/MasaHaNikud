export const GameConfig = {
    WIDTH: 1280,
    HEIGHT: 720,
    PLAYERS: {
        MAX: 4,
        COLORS: [0x2878c7, 0x4d8f35, 0xc74332, 0xe5b51a, 0x7552a5]
    },
    DICE: { X: 1180, Y: 254 },
    UI: { HEADER_HEIGHT: 90 },
    ANIMATION: { MOVE_DURATION: 180, BUTTON_DURATION: 120 }
} as const;

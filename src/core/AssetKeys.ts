export const AssetKeys = {
    Brand: { LOGO: "brand-logo", LOGO_ORIGINAL: "brand-logo-original" },
    Backgrounds: {
        MENU: "bg-menu",
        GAME: "bg-game"
    },
    Boards: {
        KAMATZ_PATACH: "board-kamatz-patach-v2",
        SEGOL_TZERE: "board-segol-tzere-v2",
        HIRIK: "board-hirik-v2",
        HOLAM: "board-holam-v2",
        SHURUK_KUBUTZ: "board-shuruk-kubutz-v2",
        MASA_HANIKUD: "board-masa-hanikud-v2",
        // Compatibility aliases for older callers.
        SHURUK: "board-shuruk-kubutz-v2",
        KAMATZ: "board-kamatz-patach-v2",
        SEGOL: "board-segol-tzere-v2",
        SNAKES: "board-masa-hanikud-v2"
    },
    Characters: {
        SOLDIER_BLUE: "soldier-blue",
        SOLDIER_GREEN: "soldier-green",
        SOLDIER_RED: "soldier-red",
        SOLDIER_YELLOW: "soldier-yellow",
        SOLDIER_PURPLE: "soldier-purple",
        SOLDIER_BROWN: "soldier-brown",
        LION: "soldier-blue",
        ELEPHANT: "soldier-green",
        GIRAFFE: "soldier-red",
        MONKEY: "soldier-yellow",
        DOG: "soldier-purple",
        CAT: "soldier-brown",
        BEAR: "soldier-blue",
        RABBIT: "soldier-green",
        FOX: "soldier-red",
        TURTLE: "soldier-yellow",
        PARROT: "soldier-purple",
        PANDA: "soldier-brown"
    },
    Dice: { BUTTON: "dice-button", IMAGE: "dice" },
    Tiles: {
        NORMAL: "tile-normal",
        START: "tile-start",
        QUESTION: "tile-question",
        BONUS: "tile-bonus",
        FINISH: "tile-finish"
    },
    Icons: {
        QUESTION: "icon-question",
        BONUS: "icon-bonus",
        WIN: "icon-win",
        STAR: "icon-star",
        FINISH: "icon-finish"
    },
    UI: { PANEL: "ui-panel", BUTTON: "ui-button" },
    Sounds: { CLICK: "click", DICE: "dice", CORRECT: "correct", WRONG: "wrong", WIN: "win" }
} as const;

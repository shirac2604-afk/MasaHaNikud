export const SceneKeys = {

    BOOT: "BootScene",

    MENU: "MenuScene",

    SETTINGS: "SettingsScene",

    PLAYER_SETUP: "PlayerSetupScene",

    CHARACTER_SELECT: "CharacterSelectScene",

    CHARACTER_SELECTION: "CharacterSelectionScene",

    BOARD_SELECT: "BoardSelectScene",

    GAME: "GameScene",

    QUESTION: "QuestionScene",

    WIN: "WinScene"

} as const;

export type SceneKey =
    typeof SceneKeys[keyof typeof SceneKeys];
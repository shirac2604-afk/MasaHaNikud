import { Tile } from "../../models/Tile";

export const ShurukBoard: Tile[] = [

    { id: 0, x: 120, y: 640, centerX: 120, centerY: 640, type: "start", questionGroup: "shuruk:tile-1" },

    { id: 1, x: 220, y: 640, centerX: 220, centerY: 640, type: "normal", questionGroup: "shuruk:tile-2" },

    { id: 2, x: 320, y: 640, centerX: 320, centerY: 640, type: "question", questionGroup: "shuruk:tile-3" },

    { id: 3, x: 420, y: 640, centerX: 420, centerY: 640, type: "normal", questionGroup: "shuruk:tile-4" },

    { id: 4, x: 520, y: 640, centerX: 520, centerY: 640, type: "bonus", questionGroup: "shuruk:tile-5" },

    { id: 5, x: 620, y: 640, centerX: 620, centerY: 640, type: "normal", questionGroup: "shuruk:tile-6" },

    { id: 6, x: 720, y: 640, centerX: 720, centerY: 640, type: "question", questionGroup: "shuruk:tile-7" },

    { id: 7, x: 820, y: 640, centerX: 820, centerY: 640, type: "normal", questionGroup: "shuruk:tile-8" },

    { id: 8, x: 920, y: 640, centerX: 920, centerY: 640, type: "bonus", questionGroup: "shuruk:tile-9" },

    { id: 9, x: 1020, y: 640, centerX: 1020, centerY: 640, type: "finish", questionGroup: "shuruk:tile-10" }

];
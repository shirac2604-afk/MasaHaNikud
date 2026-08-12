import { Tile } from "../../models/Tile";

export const KamatzBoard: Tile[] = [

    { id: 0, x: 120, y: 640, centerX: 120, centerY: 640, type: "start", questionGroup: "kamatz:tile-1" },

    { id: 1, x: 220, y: 640, centerX: 220, centerY: 640, type: "normal", questionGroup: "kamatz:tile-2" },

    { id: 2, x: 320, y: 640, centerX: 320, centerY: 640, type: "question", questionGroup: "kamatz:tile-3" },

    { id: 3, x: 420, y: 640, centerX: 420, centerY: 640, type: "normal", questionGroup: "kamatz:tile-4" },

    { id: 4, x: 520, y: 640, centerX: 520, centerY: 640, type: "bonus", questionGroup: "kamatz:tile-5" },

    { id: 5, x: 620, y: 640, centerX: 620, centerY: 640, type: "normal", questionGroup: "kamatz:tile-6" },

    { id: 6, x: 720, y: 640, centerX: 720, centerY: 640, type: "question", questionGroup: "kamatz:tile-7" },

    { id: 7, x: 820, y: 640, centerX: 820, centerY: 640, type: "normal", questionGroup: "kamatz:tile-8" },

    { id: 8, x: 920, y: 640, centerX: 920, centerY: 640, type: "bonus", questionGroup: "kamatz:tile-9" },

    { id: 9, x: 1020, y: 640, centerX: 1020, centerY: 640, type: "finish", questionGroup: "kamatz:tile-10" }

];
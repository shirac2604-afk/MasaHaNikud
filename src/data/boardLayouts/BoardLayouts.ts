import { TileType } from "../../models/Tile";

export interface NormalizedBoardPoint {
    x: number;
    y: number;
    type?: TileType;
}

export interface BoardTransition {
    from: number;
    to: number;
    kind: "ladder" | "snake";
}

export interface BoardLayoutDefinition {
    points: NormalizedBoardPoint[];
    transitions?: BoardTransition[];
}

const portraitPath: NormalizedBoardPoint[] = [
    { x: 0.88, y: 0.22, type: "start" },
    { x: 0.79, y: 0.25 },
    { x: 0.69, y: 0.26 },
    { x: 0.59, y: 0.26 },
    { x: 0.49, y: 0.27 },
    { x: 0.39, y: 0.28 },
    { x: 0.29, y: 0.30 },
    { x: 0.24, y: 0.37 },
    { x: 0.28, y: 0.44 },
    { x: 0.38, y: 0.45, type: "question" },
    { x: 0.48, y: 0.45 },
    { x: 0.58, y: 0.44 },
    { x: 0.68, y: 0.42, type: "question" },
    { x: 0.78, y: 0.41 },
    { x: 0.88, y: 0.44 },
    { x: 0.88, y: 0.52 },
    { x: 0.82, y: 0.59 },
    { x: 0.72, y: 0.59 },
    { x: 0.62, y: 0.59, type: "bonus" },
    { x: 0.52, y: 0.59 },
    { x: 0.42, y: 0.59 },
    { x: 0.32, y: 0.59, type: "question" },
    { x: 0.27, y: 0.67 },
    { x: 0.35, y: 0.72 },
    { x: 0.45, y: 0.72 },
    { x: 0.55, y: 0.72 },
    { x: 0.65, y: 0.72 },
    { x: 0.75, y: 0.72, type: "question" },
    { x: 0.67, y: 0.81 },
    { x: 0.57, y: 0.82 },
    { x: 0.47, y: 0.82 },
    { x: 0.37, y: 0.82 },
    { x: 0.27, y: 0.82, type: "bonus" },
    { x: 0.20, y: 0.88 },
    { x: 0.28, y: 0.93 },
    { x: 0.39, y: 0.93 },
    { x: 0.50, y: 0.93 },
    { x: 0.61, y: 0.93 },
    { x: 0.72, y: 0.93, type: "finish" }
];

const holamPath: NormalizedBoardPoint[] = [
    { x: 0.87, y: 0.22, type: "start" }, { x: 0.84, y: 0.31 }, { x: 0.82, y: 0.40 },
    { x: 0.80, y: 0.49 }, { x: 0.78, y: 0.58 }, { x: 0.75, y: 0.67 },
    { x: 0.72, y: 0.76 }, { x: 0.68, y: 0.84 }, { x: 0.63, y: 0.89 },
    { x: 0.57, y: 0.91 }, { x: 0.51, y: 0.90 }, { x: 0.46, y: 0.87 },
    { x: 0.41, y: 0.82 }, { x: 0.37, y: 0.76 }, { x: 0.34, y: 0.69 },
    { x: 0.31, y: 0.62 }, { x: 0.28, y: 0.55 }, { x: 0.24, y: 0.49 },
    { x: 0.20, y: 0.43 }, { x: 0.17, y: 0.36 }, { x: 0.15, y: 0.29 },
    { x: 0.16, y: 0.22 }, { x: 0.20, y: 0.16 }, { x: 0.26, y: 0.13 },
    { x: 0.33, y: 0.12 }, { x: 0.40, y: 0.12 }, { x: 0.47, y: 0.12 },
    { x: 0.54, y: 0.12 }, { x: 0.61, y: 0.13 }, { x: 0.68, y: 0.14 },
    { x: 0.74, y: 0.16 }, { x: 0.77, y: 0.23 }, { x: 0.74, y: 0.30 },
    { x: 0.69, y: 0.35 }, { x: 0.63, y: 0.38 }, { x: 0.57, y: 0.41 },
    { x: 0.52, y: 0.46 }, { x: 0.48, y: 0.52 }, { x: 0.44, y: 0.58 },
    { x: 0.41, y: 0.64 }, { x: 0.44, y: 0.70 }, { x: 0.49, y: 0.74 },
    { x: 0.55, y: 0.76 }, { x: 0.60, y: 0.73 }, { x: 0.63, y: 0.67 },
    { x: 0.60, y: 0.61 }, { x: 0.55, y: 0.57 }, { x: 0.50, y: 0.54 },
    { x: 0.46, y: 0.50 }, { x: 0.43, y: 0.45, type: "finish" }
];

function makeSnakesGrid(): NormalizedBoardPoint[] {
    const rows = [0.82, 0.66, 0.50, 0.34, 0.18];
    const points: NormalizedBoardPoint[] = [];

    rows.forEach((y, rowIndex) => {
        const xs = Array.from({ length: 10 }, (_, index) => 0.87 - index * 0.086);
        if (rowIndex % 2 === 1) {
            xs.reverse();
        }

        xs.forEach(x => points.push({ x, y }));
    });

    points[0].type = "start";
    points[49].type = "finish";
    return points;
}

export const BOARD_LAYOUTS: Record<string, BoardLayoutDefinition> = {
    kamatz: { points: portraitPath },
    shuruk: { points: portraitPath },
    segol: { points: portraitPath },
    holam: { points: holamPath },
    snakes: {
        points: makeSnakesGrid(),
        transitions: [
            // The endpoints below match the numbers printed on snakes.png.
            // Ladders always start on the lower square and finish above it.
            { from: 5, to: 16, kind: "ladder" },
            { from: 12, to: 29, kind: "ladder" },
            { from: 23, to: 38, kind: "ladder" },
            { from: 32, to: 49, kind: "ladder" },

            // Snakes always start at the head (higher square) and end at the tail.
            { from: 31, to: 10, kind: "snake" },
            { from: 34, to: 14, kind: "snake" },
            { from: 45, to: 25, kind: "snake" },
            { from: 24, to: 9, kind: "snake" }
        ]
    }
};

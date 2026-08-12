import { TileType } from "./Tile";

export interface BoardPackCoordinate {
    x: number;
    y: number;
}

/**
 * A board tile owns two independent points:
 * - center: where the visual tile is rendered.
 * - anchor: where the player's feet are placed.
 *
 * Coordinates are normalized (0..1) relative to the board bounds.
 */
export interface BoardPackPoint {
    id: number;
    center: BoardPackCoordinate;
    anchor: BoardPackCoordinate;
    type?: TileType;
    questionGroup?: string;
    label?: string;
    learningGoal?: string;
}

export interface BoardPackTransition {
    from: number;
    to: number;
    kind: "ladder" | "snake";
}

export interface BoardPackTheme {
    primary: string;
    accent: string;
    tileFill?: string;
    tileStroke?: string;
    pathStroke?: string;
}

export interface BoardPackLayout {
    referenceWidth: number;
    referenceHeight: number;
    tileRadius: number;
    renderTiles: boolean;
    renderPath: boolean;
    renderTransitions?: boolean;
    renderHeader?: boolean;
    renderEndpointBadges?: boolean;
}

export interface BoardPack {
    schemaVersion: 2;
    id: string;
    version: string;
    name: string;
    description: string;
    assetKey: string;
    image: string;
    category: string;
    questionSet: string;
    difficulty: number;
    difficultyLabel: string;
    recommendedAge: string;
    estimatedDuration: string;
    learningGoals: string[];
    theme: BoardPackTheme;
    layout: BoardPackLayout;
    path: BoardPackPoint[];
    transitions: BoardPackTransition[];
}

export interface BoardPackValidationResult {
    valid: boolean;
    errors: string[];
}

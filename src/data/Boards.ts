import { Board } from "../models/Board";
import { boardPackRegistry } from "./boardPacks/BoardPackRegistry";

/**
 * Compatibility view for older callers. New code should use boardPackRegistry
 * so board metadata and path coordinates stay sourced from the pack manifest.
 */
export const Boards: Board[] = boardPackRegistry.getAll().map(pack => ({
    id: pack.id,
    name: pack.name,
    description: pack.description,
    assetKey: pack.assetKey,
    questions: pack.questionSet,
    difficulty: pack.difficulty,
    recommendedAge: pack.recommendedAge
}));

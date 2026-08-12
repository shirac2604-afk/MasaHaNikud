import { gameState } from "./GameState";
import { DebugLogger } from "../utils/DebugLogger";
import { Player } from "../models";

/**
 * שמירת משחק מקומית. כשלי אחסון או נתונים פגומים אינם מפילים את המשחק.
 */
export class SaveService {
    private readonly KEY = "masa-ha-nikud-save";

    public save(): boolean {
        if (typeof window === "undefined") return false;

        try {
            window.localStorage.setItem(
                this.KEY,
                JSON.stringify(gameState.getPlayers())
            );
            return true;
        } catch (error) {
            DebugLogger.warn("SYSTEM", "Failed to save local game state", error);
            return false;
        }
    }

    public load(): boolean {
        if (typeof window === "undefined") return false;

        try {
            const data = window.localStorage.getItem(this.KEY);
            if (!data) return false;

            const parsed: unknown = JSON.parse(data);
            if (!this.isPlayerArray(parsed)) {
                DebugLogger.warn("SYSTEM", "Ignored invalid local game save");
                return false;
            }

            gameState.setPlayers(parsed);
            return true;
        } catch (error) {
            DebugLogger.warn("SYSTEM", "Failed to load local game state", error);
            return false;
        }
    }

    private isPlayerArray(value: unknown): value is Player[] {
        return Array.isArray(value) && value.every(player => {
            if (!player || typeof player !== "object") return false;
            const candidate = player as Partial<Player>;
            return Number.isInteger(candidate.id)
                && typeof candidate.name === "string"
                && typeof candidate.characterId === "string"
                && Number.isInteger(candidate.tile)
                && typeof candidate.score === "number"
                && Number.isInteger(candidate.skips);
        });
    }

    public clear(): boolean {
        if (typeof window === "undefined") return false;

        try {
            window.localStorage.removeItem(this.KEY);
            return true;
        } catch (error) {
            DebugLogger.warn("SYSTEM", "Failed to clear local game state", error);
            return false;
        }
    }
}

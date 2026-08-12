import { MovementResult } from "./MovementManager";
import { DebugLogger } from "../utils/DebugLogger";

export type LandingAction = "question" | "winner" | "ignored";

/**
 * מרכז את ההחלטה מה קורה לאחר נחיתת חייל.
 * המנהל מונע טיפול כפול באותה נחיתה ומחזיר פעולה אחת ברורה לסצנה.
 */
export class LandingResolutionManager {
    private resolving = false;

    public begin(result: MovementResult): LandingAction {
        if (this.resolving) {
            DebugLogger.warn("LANDING", `Blocked duplicate landing on tile ${result.tile.id}`);
            return "ignored";
        }

        this.resolving = true;
        DebugLogger.info("LANDING", `Resolving tile ${result.tile.id}`);
        return result.tile.type === "finish" ? "winner" : "question";
    }

    public complete(): void {
        this.resolving = false;
    }

    public isResolving(): boolean {
        return this.resolving;
    }

    public reset(): void {
        this.resolving = false;
    }
}

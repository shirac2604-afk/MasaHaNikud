import { DebugLogger } from "../utils/DebugLogger";

export type CleanupAction = () => void;

/**
 * מרכז פעולות ניקוי של סצנת המשחק ומבצע אותן פעם אחת בלבד, בסדר הפוך לרישום.
 * כך רכיבים תלויים מתפרקים לפני הרכיבים שעליהם הם נשענים.
 */
export class ResourceCleanupManager {
    private readonly actions: Array<{ name: string; cleanup: CleanupAction }> = [];
    private destroyed = false;

    public register(name: string, cleanup: CleanupAction): void {
        if (this.destroyed) {
            DebugLogger.warn("CLEANUP", `Late cleanup registration ignored: ${name}`);
            return;
        }
        this.actions.push({ name, cleanup });
    }

    public destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;

        for (let index = this.actions.length - 1; index >= 0; index -= 1) {
            const action = this.actions[index];
            try {
                action.cleanup();
                DebugLogger.info("CLEANUP", `Released ${action.name}`);
            } catch (error) {
                DebugLogger.error("CLEANUP", `Failed to release ${action.name}`, error);
            }
        }

        this.actions.length = 0;
    }
}

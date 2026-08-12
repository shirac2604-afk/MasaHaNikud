export type DebugArea = "STATE" | "DICE" | "MOVE" | "QUESTION" | "TURN" | "LANDING" | "SYSTEM" | "RECOVERY" | "CLEANUP" | "CONTENT";

/**
 * לוגר קטן ואחיד לבדיקות יציבות. ההודעות נשארות בקונסול בלבד
 * ואינן מפריעות למשתמש במהלך המשחק.
 */
export class DebugLogger {
    private static enabled = true;

    public static setEnabled(enabled: boolean): void {
        DebugLogger.enabled = enabled;
    }

    public static info(area: DebugArea, message: string, details?: unknown): void {
        if (!DebugLogger.enabled) return;
        if (details === undefined) {
            console.debug(`[${area}] ${message}`);
        } else {
            console.debug(`[${area}] ${message}`, details);
        }
    }

    public static error(area: DebugArea, message: string, details?: unknown): void {
        if (!DebugLogger.enabled) return;
        if (details === undefined) {
            console.error(`[${area}] ${message}`);
        } else {
            console.error(`[${area}] ${message}`, details);
        }
    }

    public static warn(area: DebugArea, message: string, details?: unknown): void {
        if (!DebugLogger.enabled) return;
        if (details === undefined) {
            console.warn(`[${area}] ${message}`);
        } else {
            console.warn(`[${area}] ${message}`, details);
        }
    }
}

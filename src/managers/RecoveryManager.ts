import Phaser from "phaser";

import { TurnPhase } from "./TurnManager";
import { DebugLogger } from "../utils/DebugLogger";

export interface RecoveryRequest {
    phase: TurnPhase;
    reason: string;
    attempt: number;
}

export interface RecoveryManagerHooks {
    getPhase: () => TurnPhase;
    onRecover: (request: RecoveryRequest) => void;
    onRepeatedFailure?: (request: RecoveryRequest) => void;
}

/**
 * מרכז את מנגנוני ההתאוששות של מחזור המשחק.
 * הוא מפעיל שעוני בטיחות רק לפעולות שאמורות להסתיים אוטומטית,
 * ולכן אינו מגביל את זמן החשיבה של תלמיד בחלון שאלה.
 */
export class RecoveryManager {
    private watchdog?: Phaser.Time.TimerEvent;
    private armedPhase?: TurnPhase;
    private armedReason = "";
    private recoveryAttempts = 0;
    private destroyed = false;

    constructor(
        private readonly scene: Phaser.Scene,
        private readonly hooks: RecoveryManagerHooks
    ) {}

    public arm(phase: TurnPhase, timeoutMs: number, reason: string): void {
        if (this.destroyed) return;
        this.cancel();
        this.armedPhase = phase;
        this.armedReason = reason;
        DebugLogger.info("RECOVERY", `Watchdog armed for ${phase} (${timeoutMs}ms)`);

        this.watchdog = this.scene.time.delayedCall(timeoutMs, () => {
            this.watchdog = undefined;
            if (this.destroyed || this.hooks.getPhase() !== phase) return;

            this.recoveryAttempts += 1;
            const request: RecoveryRequest = {
                phase,
                reason: this.armedReason,
                attempt: this.recoveryAttempts
            };
            DebugLogger.warn(
                "RECOVERY",
                `Watchdog triggered in ${phase}: ${reason} (attempt ${request.attempt})`
            );
            this.hooks.onRecover(request);

            if (request.attempt >= 3) {
                this.hooks.onRepeatedFailure?.(request);
            }
        });
    }

    public markHealthy(): void {
        this.cancel();
        this.recoveryAttempts = 0;
    }

    public cancel(): void {
        this.watchdog?.remove(false);
        this.watchdog = undefined;
        this.armedPhase = undefined;
        this.armedReason = "";
    }

    public destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.cancel();
    }
}

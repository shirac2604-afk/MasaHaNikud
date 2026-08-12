import Phaser from "phaser";

import { Dice } from "../objects/Dice";
import { GameConfig } from "../core/GameConfig";
import { soundManager } from "../services/SoundManager";
import { DebugLogger } from "../utils/DebugLogger";

export class DiceManager {
    private dice!: Dice;
    private rolling = false;
    private currentValue = 1;
    private enabled = true;
    private rollTimer?: Phaser.Time.TimerEvent;
    private safetyTimer?: Phaser.Time.TimerEvent;
    private callbackTimer?: Phaser.Time.TimerEvent;
    private rollSequence = 0;
    private acceptingRequest = false;

    constructor(private readonly scene: Phaser.Scene) {}

    public create(onRoll: (value: number) => void, onRollStart?: () => boolean): void {
        this.dice = new Dice(this.scene, GameConfig.DICE.X, GameConfig.DICE.Y);
        this.dice.getButton().on("pointerdown", () => {
            if (this.acceptingRequest || this.rolling || !this.enabled) {
                DebugLogger.warn("DICE", "Blocked duplicate or disabled roll request");
                return;
            }

            this.acceptingRequest = true;
            try {
                if (onRollStart && !onRollStart()) {
                    DebugLogger.warn("DICE", "Roll request rejected by game flow");
                    return;
                }
                DebugLogger.info("DICE", "Roll accepted");
                soundManager.playDice();
                this.roll(onRoll);
            } finally {
                this.acceptingRequest = false;
            }
        });
        this.enable();

    }

    private roll(onRoll: (value: number) => void): void {
        this.cancelTimers();
        const sequence = ++this.rollSequence;
        this.rolling = true;
        this.enabled = false;
        this.dice.setRolling(true);

        let frame = 0;
        const frames = 11;
        let finished = false;

        const finish = (): void => {
            if (finished || sequence !== this.rollSequence) return;
            finished = true;
            this.cancelTimers();
            this.currentValue = this.getWeightedResult();
            this.dice.setValue(this.currentValue);
            this.rolling = false;
            this.dice.setRolling(false);

            this.callbackTimer = this.scene.time.delayedCall(140, () => {
                if (sequence === this.rollSequence) onRoll(this.currentValue);
            });
        };

        this.rollTimer = this.scene.time.addEvent({
            delay: 60,
            repeat: frames - 1,
            callback: () => {
                if (finished || sequence !== this.rollSequence) return;
                frame += 1;
                this.currentValue = Phaser.Math.Between(1, 6);
                this.dice.setValue(this.currentValue);
                if (frame >= frames) finish();
            }
        });

        this.safetyTimer = this.scene.time.delayedCall(1050, finish);
    }

    private getWeightedResult(): number {
        // Learning-friendly distribution:
        // 1 = 27%, 2 = 26%, 3 = 26%, and 4/5/6 = 7% each.
        const roll = Phaser.Math.Between(1, 100);
        if (roll <= 27) return 1;  // 27%
        if (roll <= 53) return 2;  // 26%
        if (roll <= 79) return 3;  // 26%
        if (roll <= 86) return 4;  // 7%
        if (roll <= 93) return 5;  // 7%
        return 6;                 // 7%
    }

    public enable(): void {
        if (this.rolling) return;
        this.enabled = true;
        this.dice.setEnabled(true);
    }

    public disable(label = "ממתינים לסיום התור"): void {
        this.enabled = false;
        this.dice.setEnabled(false, label);
    }

    public isRolling(): boolean {
        return this.rolling;
    }

    public getValue(): number {
        return this.currentValue;
    }

    /** מאפס זריקה שנתקעה ומחזיר את הקובייה למצב בטוח. */
    public recover(): void {
        this.rollSequence += 1;
        this.cancelTimers();
        this.rolling = false;
        this.acceptingRequest = false;
        this.dice?.setRolling(false);
        this.enable();
        DebugLogger.warn("DICE", "Dice recovered to enabled state");
    }

    public destroy(): void {
        this.rollSequence += 1;
        this.cancelTimers();
        this.rolling = false;
        this.acceptingRequest = false;
        this.dice?.destroy();
    }

    private cancelTimers(): void {
        this.rollTimer?.remove(false);
        this.safetyTimer?.remove(false);
        this.callbackTimer?.remove(false);
        this.rollTimer = undefined;
        this.safetyTimer = undefined;
        this.callbackTimer = undefined;
    }
}

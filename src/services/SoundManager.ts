/** מנהל צלילים פרוצדורלי מרכזי לדפדפן ול-Electron. */
export class SoundManager {
    private static instance?: SoundManager;
    private context?: AudioContext;
    private enabled = true;
    private unlockListenersInstalled = false;
    private readonly pendingTimers = new Set<number>();
    private readonly activeOscillators = new Set<OscillatorNode>();
    private readonly activeGains = new Set<GainNode>();

    private constructor() {
        this.installUnlockListeners();
    }

    public static getInstance(): SoundManager {
        SoundManager.instance ??= new SoundManager();
        return SoundManager.instance;
    }

    public isEnabled(): boolean { return this.enabled; }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (enabled) {
            this.installUnlockListeners();
            this.unlock();
        } else {
            this.stopAll();
        }
    }

    public toggle(): boolean {
        this.setEnabled(!this.enabled);
        return this.enabled;
    }

    public unlock(): void {
        if (this.enabled) void this.ensureContext();
    }

    public playClick(): void { this.playTone(520, 0.055, "sine", 0.09); }
    public playDice(): void {
        [0, 55, 110, 165].forEach((delay, index) => this.schedule(
            () => this.playTone(180 + index * 55, 0.065, "square", 0.055), delay
        ));
    }
    public playCorrect(): void { this.playSequence([[523, 0, .11], [659, 95, .12], [784, 190, .20]], "sine", .11); }
    public playWrong(): void { this.playSequence([[260, 0, .14], [196, 120, .22]], "triangle", .10); }
    public playLadder(): void { this.playSequence([[392, 0, .09], [494, 80, .09], [587, 160, .13], [784, 250, .20]], "sine", .09); }
    public playSnake(): void { this.playSequence([[420, 0, .11], [330, 90, .11], [245, 180, .17], [165, 300, .24]], "sawtooth", .065); }
    public playWin(): void { this.playSequence([[523, 0, .14], [659, 125, .14], [784, 250, .14], [1047, 390, .42]], "sine", .12); }

    public cancelPending(): void {
        if (typeof window === "undefined") return;
        this.pendingTimers.forEach(timer => window.clearTimeout(timer));
        this.pendingTimers.clear();
    }

    /** עוצר מיד צלילים פעילים ומתוזמנים בלי לסגור את AudioContext המשותף. */
    public stopAll(): void {
        this.cancelPending();
        this.activeOscillators.forEach(oscillator => {
            try { oscillator.stop(); } catch { /* oscillator already stopped */ }
            try { oscillator.disconnect(); } catch { /* already disconnected */ }
        });
        this.activeGains.forEach(gain => {
            try { gain.disconnect(); } catch { /* already disconnected */ }
        });
        this.activeOscillators.clear();
        this.activeGains.clear();
    }

    private installUnlockListeners(): void {
        if (this.unlockListenersInstalled || typeof window === "undefined") return;
        this.unlockListenersInstalled = true;
        const unlockFromGesture = () => {
            this.unlock();
            window.removeEventListener("pointerdown", unlockFromGesture, true);
            window.removeEventListener("touchstart", unlockFromGesture, true);
            window.removeEventListener("keydown", unlockFromGesture, true);
            this.unlockListenersInstalled = false;
        };
        window.addEventListener("pointerdown", unlockFromGesture, true);
        window.addEventListener("touchstart", unlockFromGesture, true);
        window.addEventListener("keydown", unlockFromGesture, true);
    }

    private schedule(callback: () => void, delay: number): void {
        if (!this.enabled || typeof window === "undefined") return;
        const timer = window.setTimeout(() => {
            this.pendingTimers.delete(timer);
            if (this.enabled) callback();
        }, delay);
        this.pendingTimers.add(timer);
    }

    private playSequence(notes: Array<[number, number, number]>, type: OscillatorType, volume: number): void {
        notes.forEach(([frequency, delay, duration]) => this.schedule(
            () => this.playTone(frequency, duration, type, volume), delay
        ));
    }

    private playTone(frequency: number, duration: number, type: OscillatorType, volume: number): void {
        if (!this.enabled) return;
        void this.ensureContext().then(context => {
            if (!context || !this.enabled || context.state !== "running") return;
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const now = context.currentTime;
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            oscillator.connect(gain);
            gain.connect(context.destination);
            this.activeOscillators.add(oscillator);
            this.activeGains.add(gain);
            oscillator.addEventListener("ended", () => {
                this.activeOscillators.delete(oscillator);
                this.activeGains.delete(gain);
                try { oscillator.disconnect(); } catch { /* already disconnected */ }
                try { gain.disconnect(); } catch { /* already disconnected */ }
            }, { once: true });
            oscillator.start(now);
            oscillator.stop(now + duration + 0.03);
        });
    }

    private async ensureContext(): Promise<AudioContext | undefined> {
        if (typeof window === "undefined") return undefined;
        const audioWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
        const AudioContextClass = window.AudioContext ?? audioWindow.webkitAudioContext;
        if (!AudioContextClass) return undefined;
        try {
            this.context ??= new AudioContextClass();
            if (this.context.state === "suspended") await this.context.resume();
            return this.context;
        } catch {
            return undefined;
        }
    }
}

export const soundManager = SoundManager.getInstance();

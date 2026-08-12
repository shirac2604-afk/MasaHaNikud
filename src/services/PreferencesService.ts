export interface GamePreferences {
    soundEnabled: boolean;
    reducedMotion: boolean;
}

const STORAGE_KEY = "masa-ha-nikud.preferences.v1";
const DEFAULTS: GamePreferences = {
    soundEnabled: true,
    reducedMotion: false
};

/** העדפות משתמש הנשמרות מקומית בין הפעלות. */
export class PreferencesService {
    private preferences: GamePreferences = { ...DEFAULTS };

    constructor() {
        this.load();
    }

    public get(): Readonly<GamePreferences> {
        return this.preferences;
    }

    public isSoundEnabled(): boolean {
        return this.preferences.soundEnabled;
    }

    public isReducedMotion(): boolean {
        return this.preferences.reducedMotion;
    }

    public setSoundEnabled(enabled: boolean): void {
        this.preferences.soundEnabled = enabled;
        this.save();
    }

    public setReducedMotion(enabled: boolean): void {
        this.preferences.reducedMotion = enabled;
        this.save();
    }

    public reset(): void {
        this.preferences = { ...DEFAULTS };
        this.save();
    }

    private load(): void {
        if (typeof window === "undefined") return;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw) as Partial<GamePreferences>;
            this.preferences = {
                soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : DEFAULTS.soundEnabled,
                reducedMotion: typeof parsed.reducedMotion === "boolean" ? parsed.reducedMotion : DEFAULTS.reducedMotion
            };
        } catch {
            this.preferences = { ...DEFAULTS };
        }
    }

    private save(): void {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
        } catch {
            // המשחק ממשיך לעבוד גם כאשר אחסון מקומי חסום.
        }
    }
}

export const preferencesService = new PreferencesService();

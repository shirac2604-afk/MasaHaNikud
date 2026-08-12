export interface WinManagerHooks {
    onWinner: (playerIndex: number) => void;
}

/**
 * שומר את מצב הניצחון ומבטיח שאירוע ניצחון יטופל פעם אחת בלבד.
 * אינו תלוי ב-EventBus ולכן סיום המשחק נשאר חלק מזרימת המנוע הישירה.
 */
export class WinManager {
    private winnerIndex: number | null = null;

    constructor(private readonly hooks: WinManagerHooks) {}

    public hasWinner(): boolean {
        return this.winnerIndex !== null;
    }

    public getWinner(): number | null {
        return this.winnerIndex;
    }

    public tryDeclareWinner(playerIndex: number): boolean {
        if (this.hasWinner() || !Number.isInteger(playerIndex) || playerIndex < 0) {
            return false;
        }

        this.winnerIndex = playerIndex;
        this.hooks.onWinner(playerIndex);
        return true;
    }

    public reset(): void {
        this.winnerIndex = null;
    }

    public destroy(): void {
        this.reset();
    }
}

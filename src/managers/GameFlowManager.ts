import { TurnManager, TurnPhase } from "./TurnManager";

export interface GameFlowHooks {
    onPhaseChanged: (phase: TurnPhase) => void;
    onPlayerChanged: (playerIndex: number) => void;
}

/**
 * מתאם את מחזור התור. הוא אינו מצייר UI ואינו מזיז חיילים;
 * הוא רק מאשר שמעברי המשחק מתבצעים בסדר חוקי ומדווח לסצנה.
 */
export class GameFlowManager {
    constructor(
        private readonly turns: TurnManager,
        private readonly hooks: GameFlowHooks
    ) {}

    public start(): void {
        this.turns.reset();
        this.hooks.onPlayerChanged(this.turns.getCurrentPlayer());
        this.emitPhase();
    }

    public requestRoll(): boolean {
        const accepted = this.turns.beginRoll();
        if (accepted) this.emitPhase();
        return accepted;
    }

    public confirmRoll(): boolean {
        const accepted = this.turns.beginMovement();
        if (accepted) this.emitPhase();
        return accepted;
    }

    public confirmLanding(): boolean {
        const accepted = this.turns.beginQuestion();
        if (accepted) this.emitPhase();
        return accepted;
    }

    public confirmAnswer(): boolean {
        const accepted = this.turns.beginResolution();
        if (accepted) this.emitPhase();
        return accepted;
    }

    public finishTurn(): number | undefined {
        const nextPlayer = this.turns.completeTurn();
        if (nextPlayer === undefined) return undefined;

        this.hooks.onPlayerChanged(nextPlayer);
        this.emitPhase();
        return nextPlayer;
    }

    public recoverTurn(reason = "flow recovery"): boolean {
        const recovered = this.turns.recoverToReady(reason);
        if (recovered) this.emitPhase();
        return recovered;
    }

    public finishGame(): boolean {
        const ended = this.turns.endGame();
        if (ended) this.emitPhase();
        return ended;
    }

    public getPhase(): TurnPhase {
        return this.turns.getPhase();
    }

    public getCurrentPlayer(): number {
        return this.turns.getCurrentPlayer();
    }

    private emitPhase(): void {
        this.hooks.onPhaseChanged(this.turns.getPhase());
    }
}

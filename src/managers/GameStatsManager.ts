import { gameState } from "../services/GameState";

export interface PlayerGameStats {
    playerIndex: number;
    name: string;
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    totalAnswers: number;
    accuracy: number;
    turns: number;
    secondAttemptCorrections: number;
}

/** אוסף נתוני משחק זמניים לצורך HUD ומסך הסיום. */
export class GameStatsManager {
    private readonly correctAnswers = new Map<number, number>();
    private readonly wrongAnswers = new Map<number, number>();
    private readonly turns = new Map<number, number>();
    private readonly secondAttemptCorrections = new Map<number, number>();
    private startedAt = Date.now();

    public start(): void {
        this.startedAt = Date.now();
        gameState.getPlayers().forEach((_player, index) => {
            this.correctAnswers.set(index, 0);
            this.wrongAnswers.set(index, 0);
            this.turns.set(index, 0);
            this.secondAttemptCorrections.set(index, 0);
        });
    }

    public registerTurn(playerIndex: number): void {
        this.turns.set(playerIndex, (this.turns.get(playerIndex) ?? 0) + 1);
    }

    public registerAnswer(playerIndex: number, correct: boolean, attemptNumber = 1): void {
        const target = correct ? this.correctAnswers : this.wrongAnswers;
        target.set(playerIndex, (target.get(playerIndex) ?? 0) + 1);
        if (correct && attemptNumber > 1) {
            this.secondAttemptCorrections.set(playerIndex, (this.secondAttemptCorrections.get(playerIndex) ?? 0) + 1);
        }
    }

    public getCorrectAnswers(playerIndex: number): number {
        return this.correctAnswers.get(playerIndex) ?? 0;
    }

    public getElapsedSeconds(): number {
        return Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000));
    }

    public getPlayers(): PlayerGameStats[] {
        return gameState.getPlayers().map((player, playerIndex) => {
            const correctAnswers = this.correctAnswers.get(playerIndex) ?? 0;
            const wrongAnswers = this.wrongAnswers.get(playerIndex) ?? 0;
            const totalAnswers = correctAnswers + wrongAnswers;

            return {
                playerIndex,
                name: player.name || `שחקן ${playerIndex + 1}`,
                score: gameState.getScore(player.id),
                correctAnswers,
                wrongAnswers,
                totalAnswers,
                accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
                turns: this.turns.get(playerIndex) ?? 0,
                secondAttemptCorrections: this.secondAttemptCorrections.get(playerIndex) ?? 0
            };
        });
    }
}

import { gameState } from "../services/GameState";

/**
 * מנהל את נתוני הניקוד בלבד. הצגת הניקוד נעשית דרך UIManager.
 */
export class ScoreManager {

    public create(): void {
        // הניקוד מאותחל ב-GameState בעת יצירת השחקנים.
    }

    public addPoints(playerIndex: number, points: number): void {
        const player = gameState.getPlayer(playerIndex);

        if (!player) {
            return;
        }

        gameState.addScore(player.id, points);
    }

    public getScore(playerIndex: number): number {
        const player = gameState.getPlayer(playerIndex);

        if (!player) {
            return 0;
        }

        return gameState.getScore(player.id);
    }

    public reset(): void {
        gameState.getPlayers().forEach(player => {
            gameState.setScore(player.id, 0);
        });
    }
}

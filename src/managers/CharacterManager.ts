import { gameState } from "../services/GameState";

export class CharacterManager {
    private currentPlayer = 0;

    public getCurrentPlayer(): number {
        return this.currentPlayer;
    }

    public select(characterId: number): boolean {
        const success = gameState.selectCharacter(
            this.currentPlayer,
            characterId
        );

        if (success) {
            this.currentPlayer++;
        }

        return success;
    }

    public finished(): boolean {
        return this.currentPlayer >= gameState.getPlayerCount();
    }
}
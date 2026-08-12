import { Player } from "../models";
import { Character } from "../models/Character";
import { Characters } from "../data/Characters";

class GameState {
    private players: Player[] = [];
    private boardId = "";
    private currentPlayer = 0;
    private selectedCharacters: string[] = [];
    private scores: Map<number, number> = new Map();
    private playerCount = 0;

    public reset(): void {
        this.players = [];
        this.boardId = "";
        this.currentPlayer = 0;
        this.selectedCharacters = [];
        this.scores.clear();
        this.playerCount = 0;
    }

    public setPlayerCount(count: number): void {
        if (!Number.isInteger(count) || count < 1 || count > 4) {
            throw new Error("Player count must be an integer between 1 and 4.");
        }
        this.playerCount = count;
    }

    public createPlayers(): void {
        const players: Player[] = [];
        for (let index = 0; index < this.playerCount; index++) {
            players.push({
                id: index,
                name: `שחקן ${index + 1}`,
                characterId: "",
                tile: 1,
                score: 0,
                skips: 0
            });
        }
        this.setPlayers(players);
    }

    public getCharacters(): Character[] {
        return Characters.map(character => ({
            ...character,
            selected: this.selectedCharacters.includes(character.texture)
        }));
    }

    public selectCharacter(playerIndex: number, characterId: number): boolean {
        const character = Characters.find(item => item.id === characterId);
        if (!character || this.selectedCharacters.includes(character.texture)) {
            return false;
        }
        this.setPlayerCharacter(playerIndex, character.texture);
        return true;
    }

    public setPlayers(players: Player[]): void {
        this.players = players;
        this.scores.clear();
        players.forEach(player => {
            this.scores.set(player.id, 0);
        });
    }

    public getPlayers(): Player[] {
        return this.players;
    }

    public getPlayer(index: number): Player {
        return this.players[index];
    }

    public getPlayerCount(): number {
        return this.players.length || this.playerCount;
    }

    public updatePlayer(player: Player): void {
        const index = this.players.findIndex(p => p.id === player.id);
        if (index >= 0) {
            this.players[index] = player;
        }
    }

    public setBoard(id: string): void {
        this.boardId = id;
    }

    public getBoard(): string {
        return this.boardId;
    }

    public setCurrentPlayer(index: number): void {
        this.currentPlayer = index;
    }

    public getCurrentPlayer(): number {
        return this.currentPlayer;
    }

    public nextPlayer(): number {
        this.currentPlayer++;
        if (this.currentPlayer >= this.players.length) {
            this.currentPlayer = 0;
        }
        return this.currentPlayer;
    }

    public setPlayerCharacter(playerIndex: number, texture: string): void {
        this.selectedCharacters[playerIndex] = texture;
    }

    public getPlayerCharacter(playerIndex: number): string {
        return this.selectedCharacters[playerIndex];
    }

    public getPlayerCharacters(): string[] {
        return this.selectedCharacters;
    }

    public setScore(playerId: number, score: number): void {
        this.scores.set(playerId, score);
    }

    public addScore(playerId: number, value: number): void {
        const current = this.getScore(playerId);
        this.scores.set(playerId, current + value);
    }

    public getScore(playerId: number): number {
        return this.scores.get(playerId) ?? 0;
    }
}

export const gameState = new GameState();

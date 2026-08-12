import { BoardPack } from "../models/BoardPack";
import { boardPackRegistry } from "../data/boardPacks/BoardPackRegistry";

export class BoardRepository {
    public getAll(): BoardPack[] { return boardPackRegistry.getAll(); }
    public getById(id: string): BoardPack | undefined { return boardPackRegistry.getById(id); }
    public exists(id: string): boolean { return this.getById(id) !== undefined; }
}

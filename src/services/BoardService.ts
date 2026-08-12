import { BoardPack, BoardPackTransition } from "../models/BoardPack";
import { Tile } from "../models";

export interface BoardBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class BoardService {
    private readonly tiles: Tile[];
    private readonly transitions = new Map<number, BoardPackTransition>();

    constructor(private readonly pack: BoardPack, private readonly bounds: BoardBounds) {
        this.tiles = pack.path.map(point => {
            let type: Tile["type"] = point.type ?? "normal";

            if (point.id === 1) type = "start";
            else if (point.id === pack.path.length) type = "finish";

            return {
                id: point.id,
                x: bounds.x + point.anchor.x * bounds.width,
                y: bounds.y + point.anchor.y * bounds.height,
                centerX: bounds.x + point.center.x * bounds.width,
                centerY: bounds.y + point.center.y * bounds.height,
                type,
                questionGroup: point.questionGroup ?? `${pack.questionSet}:tile-${point.id}`,
                label: point.label
            };
        });

        pack.transitions.forEach(transition => this.transitions.set(transition.from, transition));
    }

    public getTiles(): readonly Tile[] { return this.tiles; }
    public getTile(id: number): Tile | undefined { return this.tiles[id - 1]; }
    public getStartTile(): Tile { return this.tiles[0]; }
    public getTileCount(): number { return this.tiles.length; }
    public getTransition(tileId: number): BoardPackTransition | undefined { return this.transitions.get(tileId); }
    public getPack(): BoardPack { return this.pack; }
    public getBounds(): BoardBounds { return this.bounds; }
}

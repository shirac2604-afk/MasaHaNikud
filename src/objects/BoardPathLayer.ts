import Phaser from "phaser";
import { BoardPack, BoardPackTransition } from "../models/BoardPack";
import { BoardBounds, BoardService } from "../services/BoardService";
import { Theme } from "../theme/Theme";

function parseHex(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const normalized = value.replace("#", "");
    const parsed = Number.parseInt(normalized, 16);
    return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Engine-owned board layer. Decorative backgrounds never determine gameplay;
 * the path, tiles, ladders and snakes are rendered from the board manifest.
 */
export class BoardPathLayer {
    private readonly container: Phaser.GameObjects.Container;
    private readonly connectors: Phaser.GameObjects.Graphics;
    private readonly transitions: Phaser.GameObjects.Graphics;
    private readonly tileContainers: Phaser.GameObjects.Container[] = [];

    constructor(
        private readonly scene: Phaser.Scene,
        private readonly boardService: BoardService,
        private readonly pack: BoardPack,
        private readonly bounds: BoardBounds
    ) {
        this.container = scene.add.container(0, 0).setDepth(5);
        this.connectors = scene.add.graphics();
        this.transitions = scene.add.graphics();
        this.container.add([this.connectors, this.transitions]);
        this.create();
    }

    private create(): void {
        if (this.pack.layout.renderPath) this.drawConnectors();
        if (this.pack.layout.renderTransitions !== false) this.drawTransitions();
        if (this.pack.layout.renderTiles) this.drawTiles();
    }

    private drawConnectors(): void {
        const tiles = this.boardService.getTiles();
        if (tiles.length < 2) return;

        const pathColor = parseHex(this.pack.theme.pathStroke, 0xf6d36b);
        const scale = Math.min(
            this.bounds.width / this.pack.layout.referenceWidth,
            this.bounds.height / this.pack.layout.referenceHeight
        );
        const width = Math.max(8, this.pack.layout.tileRadius * scale * 0.75);

        this.connectors.lineStyle(width + 5, 0x10243d, 0.42);
        this.connectors.beginPath();
        this.connectors.moveTo(tiles[0].centerX, tiles[0].centerY);
        tiles.slice(1).forEach(tile => this.connectors.lineTo(tile.centerX, tile.centerY));
        this.connectors.strokePath();

        this.connectors.lineStyle(width, pathColor, 0.92);
        this.connectors.beginPath();
        this.connectors.moveTo(tiles[0].centerX, tiles[0].centerY);
        tiles.slice(1).forEach(tile => this.connectors.lineTo(tile.centerX, tile.centerY));
        this.connectors.strokePath();
    }

    private drawTransitions(): void {
        this.pack.transitions.forEach(transition => {
            if (transition.kind === "ladder") this.drawLadder(transition);
            else this.drawSnake(transition);
        });
    }

    private getTransitionPoints(transition: BoardPackTransition): { from: Phaser.Math.Vector2; to: Phaser.Math.Vector2 } | undefined {
        const fromTile = this.boardService.getTile(transition.from);
        const toTile = this.boardService.getTile(transition.to);
        if (!fromTile || !toTile) return undefined;
        return {
            from: new Phaser.Math.Vector2(fromTile.centerX, fromTile.centerY),
            to: new Phaser.Math.Vector2(toTile.centerX, toTile.centerY)
        };
    }

    private drawLadder(transition: BoardPackTransition): void {
        const points = this.getTransitionPoints(transition);
        if (!points) return;
        const { from, to } = points;
        const direction = to.clone().subtract(from);
        const length = Math.max(1, direction.length());
        const unit = direction.clone().scale(1 / length);
        const perpendicular = new Phaser.Math.Vector2(-unit.y, unit.x).scale(10);
        const railAStart = from.clone().add(perpendicular);
        const railAEnd = to.clone().add(perpendicular);
        const railBStart = from.clone().subtract(perpendicular);
        const railBEnd = to.clone().subtract(perpendicular);

        this.transitions.lineStyle(11, 0x59371f, 0.35);
        this.transitions.lineBetween(railAStart.x + 3, railAStart.y + 4, railAEnd.x + 3, railAEnd.y + 4);
        this.transitions.lineBetween(railBStart.x + 3, railBStart.y + 4, railBEnd.x + 3, railBEnd.y + 4);
        this.transitions.lineStyle(7, 0xf0b44d, 1);
        this.transitions.lineBetween(railAStart.x, railAStart.y, railAEnd.x, railAEnd.y);
        this.transitions.lineBetween(railBStart.x, railBStart.y, railBEnd.x, railBEnd.y);

        const rungCount = Math.max(4, Math.floor(length / 42));
        for (let index = 1; index < rungCount; index++) {
            const t = index / rungCount;
            const center = from.clone().lerp(to, t);
            const a = center.clone().add(perpendicular);
            const b = center.clone().subtract(perpendicular);
            this.transitions.lineStyle(5, 0xffd979, 1);
            this.transitions.lineBetween(a.x, a.y, b.x, b.y);
        }
    }

    private drawSnake(transition: BoardPackTransition): void {
        const points = this.getTransitionPoints(transition);
        if (!points) return;
        const { from, to } = points;
        const direction = to.clone().subtract(from);
        const length = Math.max(1, direction.length());
        const unit = direction.clone().scale(1 / length);
        const perpendicular = new Phaser.Math.Vector2(-unit.y, unit.x);
        const amplitude = Math.min(34, Math.max(18, length * 0.12));
        const segments = Math.max(18, Math.floor(length / 12));
        const snakeColor = transition.from % 2 === 0 ? 0x6fbf55 : 0xe36f78;

        const pointsAlong: Phaser.Math.Vector2[] = [];
        for (let index = 0; index <= segments; index++) {
            const t = index / segments;
            const base = from.clone().lerp(to, t);
            const wave = Math.sin(t * Math.PI * 4) * amplitude * Math.sin(t * Math.PI);
            pointsAlong.push(base.add(perpendicular.clone().scale(wave)));
        }

        this.transitions.lineStyle(18, 0x122438, 0.25);
        this.transitions.beginPath();
        this.transitions.moveTo(pointsAlong[0].x + 4, pointsAlong[0].y + 5);
        pointsAlong.slice(1).forEach(point => this.transitions.lineTo(point.x + 4, point.y + 5));
        this.transitions.strokePath();

        this.transitions.lineStyle(13, snakeColor, 1);
        this.transitions.beginPath();
        this.transitions.moveTo(pointsAlong[0].x, pointsAlong[0].y);
        pointsAlong.slice(1).forEach(point => this.transitions.lineTo(point.x, point.y));
        this.transitions.strokePath();

        this.transitions.fillStyle(snakeColor, 1);
        this.transitions.fillCircle(from.x, from.y, 16);
        const eyeOffset = perpendicular.clone().scale(6);
        const eyeForward = unit.clone().scale(-5);
        const eyeA = from.clone().add(eyeOffset).add(eyeForward);
        const eyeB = from.clone().subtract(eyeOffset).add(eyeForward);
        this.transitions.fillStyle(0xffffff, 1);
        this.transitions.fillCircle(eyeA.x, eyeA.y, 4);
        this.transitions.fillCircle(eyeB.x, eyeB.y, 4);
        this.transitions.fillStyle(0x17243a, 1);
        this.transitions.fillCircle(eyeA.x, eyeA.y, 2);
        this.transitions.fillCircle(eyeB.x, eyeB.y, 2);
    }

    private drawTiles(): void {
        const fill = parseHex(this.pack.theme.tileFill, 0xfff7d6);
        const stroke = parseHex(this.pack.theme.tileStroke, Theme.colors.goldDark);
        const scale = Math.min(
            this.bounds.width / this.pack.layout.referenceWidth,
            this.bounds.height / this.pack.layout.referenceHeight
        );
        const radius = Math.max(18, this.pack.layout.tileRadius * scale);
        const isJourney = this.pack.id === "masa-hanikud";
        const tileWidth = isJourney ? Math.max(34, radius * 1.55) : Math.max(68, radius * 2.15);
        const tileHeight = isJourney ? Math.max(30, radius * 1.25) : Math.max(52, radius * 1.45);

        this.boardService.getTiles().forEach(tile => {
            const graphics = this.scene.add.graphics();
            const accent = parseHex(this.pack.theme.accent, 0xf6d36b);
            const tileFill = tile.type === "start"
                ? 0xcff2c6
                : tile.type === "finish"
                    ? 0xffd4cc
                    : tile.id % 2 === 0
                        ? fill
                        : this.mixColors(fill, accent, 0.10);

            if (isJourney) {
                graphics.fillStyle(0x000000, 0.24);
                graphics.fillRoundedRect(-tileWidth / 2 + 3, -tileHeight / 2 + 5, tileWidth, tileHeight, 10);
                graphics.fillStyle(tileFill, 0.99);
                graphics.fillRoundedRect(-tileWidth / 2, -tileHeight / 2, tileWidth, tileHeight, 10);
                graphics.lineStyle(Math.max(2, radius * 0.08), stroke, 0.96);
                graphics.strokeRoundedRect(-tileWidth / 2, -tileHeight / 2, tileWidth, tileHeight, 10);
                graphics.lineStyle(1.5, 0xffffff, 0.65);
                graphics.strokeRoundedRect(-tileWidth / 2 + 4, -tileHeight / 2 + 4, tileWidth - 8, tileHeight - 8, 7);
            } else {
                this.drawLearningStone(graphics, tileWidth, tileHeight, tileFill, stroke, tile.id);
            }

            const displayText = tile.label?.trim() || String(tile.id);
            const label = this.scene.add.text(0, 0, displayText, {
                fontFamily: Theme.fonts.family,
                fontSize: `${isJourney ? Math.max(13, Math.round(radius * 0.58)) : Math.max(22, Math.round(radius * 0.82))}px`,
                fontStyle: "bold",
                color: "#14243a",
                stroke: "#ffffff",
                strokeThickness: isJourney ? 1 : 2,
                rtl: true,
                align: "center"
            }).setOrigin(0.5);

            const tileContainer = this.scene.add.container(tile.centerX, tile.centerY, [graphics, label]);
            this.tileContainers.push(tileContainer);
            this.container.add(tileContainer);
        });
    }


    private drawLearningStone(
        graphics: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        fill: number,
        stroke: number,
        seed: number
    ): void {
        const halfW = width / 2;
        const halfH = height / 2;
        const wobble = (seed % 3) - 1;
        const points = [
            new Phaser.Geom.Point(-halfW + 7, -halfH + 2 + wobble),
            new Phaser.Geom.Point(halfW - 10, -halfH - 1),
            new Phaser.Geom.Point(halfW + 1, -halfH + 9),
            new Phaser.Geom.Point(halfW - 3, halfH - 6),
            new Phaser.Geom.Point(halfW - 13, halfH + 1),
            new Phaser.Geom.Point(-halfW + 9, halfH - 1),
            new Phaser.Geom.Point(-halfW - 1, halfH - 10),
            new Phaser.Geom.Point(-halfW + 1, -halfH + 10)
        ];

        const shadow = points.map(point => new Phaser.Geom.Point(point.x + 4, point.y + 6));
        graphics.fillStyle(0x000000, 0.22);
        graphics.fillPoints(shadow, true);

        graphics.fillStyle(fill, 1);
        graphics.fillPoints(points, true);
        graphics.lineStyle(3, stroke, 0.9);
        graphics.strokePoints(points, true, true);

        graphics.lineStyle(2, 0xffffff, 0.62);
        graphics.beginPath();
        graphics.moveTo(-halfW + 10, -halfH + 8);
        graphics.lineTo(halfW - 14, -halfH + 5);
        graphics.strokePath();

        graphics.lineStyle(1.5, 0x7f6d55, 0.18);
        graphics.beginPath();
        graphics.moveTo(-halfW + 14, halfH - 8);
        graphics.lineTo(-halfW + 24, halfH - 13);
        graphics.lineTo(-halfW + 31, halfH - 9);
        graphics.strokePath();
    }

    private mixColors(base: number, overlay: number, amount: number): number {
        const clamped = Phaser.Math.Clamp(amount, 0, 1);
        const br = (base >> 16) & 0xff;
        const bg = (base >> 8) & 0xff;
        const bb = base & 0xff;
        const or = (overlay >> 16) & 0xff;
        const og = (overlay >> 8) & 0xff;
        const ob = overlay & 0xff;
        const r = Math.round(br + (or - br) * clamped);
        const g = Math.round(bg + (og - bg) * clamped);
        const b = Math.round(bb + (ob - bb) * clamped);
        return (r << 16) | (g << 8) | b;
    }

    public destroy(): void {
        this.tileContainers.length = 0;
        this.container.destroy(true);
    }
}

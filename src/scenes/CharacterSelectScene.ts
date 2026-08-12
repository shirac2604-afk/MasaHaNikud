import { BaseScene } from "../core/BaseScene";
import { SceneKeys } from "../core/SceneKeys";
import { AssetKeys } from "../core/AssetKeys";
import { CharacterManager } from "../managers/CharacterManager";
import { CharacterCard } from "../ui/CharacterCard";
import { gameState } from "../services/GameState";

export class CharacterSelectScene extends BaseScene {
    private manager!: CharacterManager;

    constructor() { super(SceneKeys.CHARACTER_SELECT); }

    create(): void {
        this.manager = new CharacterManager();
        this.drawScreen();
    }

    private drawScreen(): void {
        this.children.removeAll();
        this.setBackground(AssetKeys.Boards.HOLAM);
        this.createBrandMark();
        this.createHeader(`שחקן ${this.manager.getCurrentPlayer() + 1} – בחרו חייל`, "כל דמות יכולה להיבחר פעם אחת בלבד");
        this.createGlassPanel(640, 405, 1215, 420).setDepth(2);

        const characters = gameState.getCharacters();
        characters.forEach((character, index) => {
            new CharacterCard(this, character, 135 + index * 202, 410, (characterId: number) => {
                if (!this.manager.select(characterId)) return;
                if (this.manager.finished()) {
                    this.scene.start(SceneKeys.BOARD_SELECT);
                    return;
                }
                this.drawScreen();
            });
        });

        this.createButton(130, 675, "חזרה", () => this.scene.start(SceneKeys.PLAYER_SETUP), 220, "secondary");
    }
}

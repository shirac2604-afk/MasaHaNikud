import Phaser from "phaser";
import { boardPackRegistry } from "../data/boardPacks/BoardPackRegistry";
import { resolvePublicAssetUrl } from "./AssetUrl";

/** Dedicated texture key for a board-library thumbnail. */
export function getBoardPreviewKey(boardId: string): string {
    return `board-preview-${boardId}`;
}

/** Full preview artwork shown only in the board library. */
function getBoardPreviewPath(boardId: string): string {
    return `assets/boards/approved/${boardId}.png`;
}

/** Loads board artwork in both Vite development and packaged Electron builds. */
export class BoardLoader {
    public static load(scene: Phaser.Scene): void {
        const onLoadError = (file: Phaser.Loader.File): void => {
            if (file.type === "image" && String(file.key).startsWith("board-")) {
                console.error(`[BOARD ASSET] Failed to load ${file.key} from ${file.url}`);
            }
        };

        scene.load.on("loaderror", onLoadError);
        scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
            scene.load.off("loaderror", onLoadError);
        });

        boardPackRegistry.getAll().forEach(pack => {
            // Runtime board background used in GameScene.
            scene.load.image(pack.assetKey, resolvePublicAssetUrl(pack.image));
            // Full illustrated thumbnail used by BoardSelectScene and BoardCard.
            scene.load.image(
                getBoardPreviewKey(pack.id),
                resolvePublicAssetUrl(getBoardPreviewPath(pack.id))
            );
        });
    }
}

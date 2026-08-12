import Phaser from "phaser";
import { BoardLoader } from "./BoardLoader";
import { CharacterLoader } from "./CharacterLoader";
import { BrandLoader } from "./BrandLoader";

export class AssetLoader {
    public static load(scene: Phaser.Scene): void {
        BrandLoader.load(scene);
        BoardLoader.load(scene);
        CharacterLoader.load(scene);
    }
}

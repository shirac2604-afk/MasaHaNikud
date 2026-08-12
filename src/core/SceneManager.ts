import Phaser from "phaser";

export class SceneManager {

    constructor(
        private readonly scene: Phaser.Scene
    ) {}

    public goTo(sceneKey: string): void {

        this.scene.scene.start(sceneKey);

    }

}
import Phaser from "phaser";
import { AppInfo } from "../core/AppInfo";
import { Theme } from "../theme/Theme";

export class MenuFooter extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, width: number, height: number) {
        super(scene, width / 2, height - 27);
        scene.add.existing(this);

        const line = scene.add.rectangle(0, -19, width - 52, 1, 0xffffff, 0.14);
        const version = scene.add.text(-width / 2 + 28, 0, `גרסה ${AppInfo.version}`, {
            ...Theme.fonts.caption,
            rtl: true
        }).setOrigin(0, 0.5);
        const brand = scene.add.text(width / 2 - 28, 0, `© 2026 ${AppInfo.brand}`, {
            ...Theme.fonts.caption,
            rtl: true
        }).setOrigin(1, 0.5);
        const middle = scene.add.text(0, 0, "מותאם למקרנים וללוחות חכמים", {
            fontFamily: Theme.fonts.family,
            fontSize: "14px",
            color: "#BFD4EB",
            rtl: true
        }).setOrigin(0.5);

        this.add([line, version, brand, middle]);
        this.setDepth(40);
    }
}

import Phaser from "phaser";
import { BaseScene } from "../core/BaseScene";
import { SceneKeys } from "../core/SceneKeys";
import { AssetKeys } from "../core/AssetKeys";
import { AssetLoader } from "../loaders/AssetLoader";
import { preferencesService } from "../services/PreferencesService";
import { soundManager } from "../services/SoundManager";
import { BrandBadge } from "../ui/BrandBadge";

export class BootScene extends BaseScene {
    constructor() {
        super(SceneKeys.BOOT);
    }

    preload(): void {
        this.createLoadingScreen();
        AssetLoader.load(this);
    }

    create(): void {
        soundManager.setEnabled(preferencesService.isSoundEnabled());
        this.showBrandSplash();
    }

    private createLoadingScreen(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.cameras.main.setBackgroundColor("#071735");

        const glow = this.add.graphics();
        glow.fillStyle(0x13b7cf, 0.12);
        glow.fillCircle(width * 0.25, height * 0.22, 240);
        glow.fillStyle(0x7b2cbf, 0.12);
        glow.fillCircle(width * 0.78, height * 0.72, 260);

        const title = this.add.text(width / 2, height / 2 - 105, "מכינים את מסע הניקוד...", {
            fontFamily: "Arial",
            fontSize: "38px",
            color: "#ffffff",
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0.5);

        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x020817, 0.78);
        progressBox.fillRoundedRect(width / 2 - 230, height / 2 - 20, 460, 54, 18);
        progressBox.lineStyle(2, 0xe6a400, 0.9);
        progressBox.strokeRoundedRect(width / 2 - 230, height / 2 - 20, 460, 54, 18);

        const progressBar = this.add.graphics();
        const percentText = this.add.text(width / 2, height / 2 + 73, "0%", {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#f7d56a",
            fontStyle: "bold"
        }).setOrigin(0.5);

        const assetText = this.add.text(width / 2, height / 2 + 112, "", {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#cbd8ef"
        }).setOrigin(0.5);

        this.load.on("progress", (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0x13b7cf, 1);
            progressBar.fillRoundedRect(width / 2 - 218, height / 2 - 8, 436 * value, 30, 12);
            percentText.setText(`${Math.floor(value * 100)}%`);
        });

        this.load.on("fileprogress", (file: Phaser.Loader.File) => {
            assetText.setText(`טוען: ${file.key}`);
        });

        this.load.on("complete", () => {
            [progressBar, progressBox, percentText, assetText, title, glow].forEach((item) => item.destroy());
        });
    }

    private showBrandSplash(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.cameras.main.setBackgroundColor("#ffffff");

        const logo = new BrandBadge(this, {
            x: width / 2,
            y: height / 2 - 34,
            diameter: 300,
            depth: 10,
            frameless: true
        }).setAlpha(0);

        const status = this.add.text(width / 2, height - 48, "פותחים עולם של למידה ומשחק", {
            fontFamily: "Arial",
            fontSize: "20px",
            color: "#10245b",
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: [logo, status],
            alpha: 1,
            duration: 420,
            ease: "Sine.Out"
        });
        this.tweens.add({
            targets: logo,
            scale: 1.035,
            duration: 1300,
            ease: "Sine.InOut",
            yoyo: true
        });

        this.time.delayedCall(1750, () => {
            this.cameras.main.fadeOut(350, 7, 23, 53);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(SceneKeys.MENU);
            });
        });
    }
}

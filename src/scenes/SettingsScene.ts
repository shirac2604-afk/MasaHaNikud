import Phaser from "phaser";
import { BaseScene } from "../core/BaseScene";
import { SceneKeys } from "../core/SceneKeys";
import { AssetKeys } from "../core/AssetKeys";
import { Colors } from "../theme/Colors";
import { preferencesService } from "../services/PreferencesService";
import { soundManager } from "../services/SoundManager";
import { AppInfo } from "../core/AppInfo";

export class SettingsScene extends BaseScene {
    private soundValue!: Phaser.GameObjects.Text;
    private motionValue!: Phaser.GameObjects.Text;
    private fullscreenValue!: Phaser.GameObjects.Text;

    constructor() {
        super(SceneKeys.SETTINGS);
    }

    public create(): void {
        this.setBackground(AssetKeys.Boards.SEGOL);
        this.createBrandMark();
        this.createHeader("הגדרות", "התאימו את המשחק לכיתה ולשחקנים");
        this.createGlassPanel(640, 397, 830, 460).setDepth(5);

        this.createSettingRow(640, 260, "צלילים", "אפקטים לזריקה, תשובות וסיום המשחק", "sound");
        this.createSettingRow(640, 365, "אנימציות", "מצב רגוע מפחית תנועה ואפקטים ממושכים", "motion");
        this.createSettingRow(640, 470, "מסך מלא", "מתאים במיוחד למחשב כיתתי וללוח חכם", "fullscreen");

        this.createButton(470, 610, "איפוס הגדרות", () => this.resetPreferences(), 280, "danger");
        this.createButton(810, 610, "חזרה לתפריט", () => this.scene.start(SceneKeys.MENU), 280, "secondary");

        this.add.text(640, 680, `${AppInfo.name} v${AppInfo.version}  •  ${AppInfo.brand}`, {
            fontFamily: "Arial", fontSize: "17px", color: "#d8e8ff", rtl: true
        }).setOrigin(0.5).setDepth(20);

        this.refreshLabels();
    }

    private createSettingRow(
        x: number,
        y: number,
        title: string,
        description: string,
        kind: "sound" | "motion" | "fullscreen"
    ): void {
        const row = this.add.container(x, y).setDepth(10);
        const shadow = this.add.rectangle(5, 6, 700, 84, 0x000000, 0.24);
        const background = this.add.rectangle(0, 0, 700, 84, 0x153653, 0.97)
            .setStrokeStyle(2, Colors.border, 0.95);
        const titleText = this.add.text(285, -17, title, {
            fontFamily: "Arial", fontSize: "25px", fontStyle: "bold", color: "#fff1b5", rtl: true
        }).setOrigin(1, 0.5);
        const descriptionText = this.add.text(285, 18, description, {
            fontFamily: "Arial", fontSize: "16px", color: "#cfe3f6", rtl: true
        }).setOrigin(1, 0.5);
        const toggle = this.add.rectangle(-245, 0, 150, 48, 0x2d8f62, 1)
            .setStrokeStyle(3, 0xffe4a0, 0.95)
            .setInteractive({ useHandCursor: true });
        const value = this.add.text(-245, 0, "", {
            fontFamily: "Arial", fontSize: "20px", fontStyle: "bold", color: "#ffffff", rtl: true
        }).setOrigin(0.5);

        row.add([shadow, background, titleText, descriptionText, toggle, value]);
        toggle.on("pointerover", () => this.tweens.add({ targets: [toggle, value], scaleX: 1.04, scaleY: 1.04, duration: 90 }));
        toggle.on("pointerout", () => this.tweens.add({ targets: [toggle, value], scaleX: 1, scaleY: 1, duration: 90 }));
        toggle.on("pointerdown", () => this.toggle(kind));

        if (kind === "sound") this.soundValue = value;
        if (kind === "motion") this.motionValue = value;
        if (kind === "fullscreen") this.fullscreenValue = value;
    }

    private toggle(kind: "sound" | "motion" | "fullscreen"): void {
        if (kind === "sound") {
            const enabled = !preferencesService.isSoundEnabled();
            preferencesService.setSoundEnabled(enabled);
            soundManager.setEnabled(enabled);
            if (enabled) soundManager.playClick();
        } else if (kind === "motion") {
            preferencesService.setReducedMotion(!preferencesService.isReducedMotion());
            soundManager.playClick();
        } else {
            if (this.scale.isFullscreen) this.scale.stopFullscreen();
            else this.scale.startFullscreen();
            soundManager.playClick();
        }
        this.time.delayedCall(80, () => this.refreshLabels());
    }

    private resetPreferences(): void {
        preferencesService.reset();
        soundManager.setEnabled(true);
        this.refreshLabels();
        this.showMessage("ההגדרות אופסו בהצלחה", "#8cff8c");
    }

    private refreshLabels(): void {
        this.soundValue?.setText(preferencesService.isSoundEnabled() ? "🔊 פעיל" : "🔇 מושתק");
        this.motionValue?.setText(preferencesService.isReducedMotion() ? "רגוע" : "מלא");
        this.fullscreenValue?.setText(this.scale.isFullscreen ? "יציאה" : "הפעלה");
    }
}

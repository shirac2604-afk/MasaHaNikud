import Phaser from "phaser";
import { BaseScene } from "../core/BaseScene";
import { SceneKeys } from "../core/SceneKeys";
import { AssetKeys } from "../core/AssetKeys";
import { Colors } from "../theme/Colors";
import { Theme } from "../theme/Theme";
import { DesktopAppService } from "../services/DesktopAppService";
import { BrandBadge } from "../ui/BrandBadge";
import { MenuActionButton } from "../ui/MenuActionButton";
import { MenuFooter } from "../ui/MenuFooter";

/** Main menu kept intentionally focused for the 1.0 release candidate. */
export class MenuScene extends BaseScene {
    private activeModal?: Phaser.GameObjects.Container;

    constructor() {
        super(SceneKeys.MENU);
    }

    create(): void {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.setBackground(AssetKeys.Boards.KAMATZ);
        this.createAmbientBackdrop(width, height);

        const badge = this.createTopRightBadge(width);
        const hero = this.createHero(width);
        const layout = this.getMenuLayout(width, height);
        const panel = this.createMenuPanel(layout);
        const buttons = this.createMenuActions(layout);
        const footer = new MenuFooter(this, width, height).setAlpha(0);

        this.playEntrance(badge, hero, panel, buttons, footer);
    }

    private createTopRightBadge(width: number): BrandBadge {
        const diameter = Phaser.Math.Clamp(width * 0.09, 96, 124);
        const margin = Math.max(22, width * 0.018);
        return new BrandBadge(this, {
            x: width - margin - diameter / 2,
            y: margin + diameter / 2,
            diameter,
            depth: 40,
            frameless: true
        }).setAlpha(0).setScale(0.92);
    }

    private createHero(width: number): Phaser.GameObjects.Container {
        const hero = this.add.container(width / 2, 102).setDepth(20).setAlpha(0);

        const title = this.add.text(0, -22, "מסע הניקוד", {
            fontFamily: Theme.fonts.family,
            fontSize: "58px",
            fontStyle: "bold",
            color: "#FFF4D2",
            stroke: "#28114F",
            strokeThickness: 6,
            rtl: true
        }).setOrigin(0.5);
        const subtitle = this.add.text(0, 34, "לומדים • משחקים • מצליחים", {
            ...Theme.fonts.subtitle,
            fontSize: "22px",
            rtl: true
        }).setOrigin(0.5);
        const brandLine = this.add.text(0, 67, "מבית מפתחות להצלחה", {
            fontFamily: Theme.fonts.family,
            fontSize: "16px",
            color: "#F3D37C",
            fontStyle: "bold",
            rtl: true
        }).setOrigin(0.5);

        hero.add([title, subtitle, brandLine]);
        return hero;
    }

    private getMenuLayout(width: number, height: number): {
        x: number;
        firstButtonY: number;
        buttonGap: number;
        buttonWidth: number;
        panelY: number;
        panelWidth: number;
        panelHeight: number;
    } {
        const buttonCount = 4;
        const buttonHeight = 70;
        const topSafeArea = Math.max(230, height * 0.32);
        const bottomSafeArea = Math.min(height - 140, 580);
        const usableHeight = Math.max(buttonHeight * buttonCount + 32, bottomSafeArea - topSafeArea);
        const buttonGap = Math.max(buttonHeight + 8, usableHeight / Math.max(1, buttonCount - 1));
        const firstButtonY = topSafeArea;
        const lastButtonY = firstButtonY + buttonGap * (buttonCount - 1);
        const panelTop = firstButtonY - 56;
        const panelBottom = lastButtonY + 56;

        return {
            x: width / 2,
            firstButtonY,
            buttonGap,
            buttonWidth: Math.min(410, width - 160),
            panelY: (panelTop + panelBottom) / 2,
            panelWidth: Math.min(520, width - 100),
            panelHeight: panelBottom - panelTop
        };
    }

    private createMenuPanel(layout: ReturnType<MenuScene["getMenuLayout"]>): Phaser.GameObjects.Container {
        const panel = this.add.container(layout.x, layout.panelY).setDepth(10).setAlpha(0);
        const halfWidth = layout.panelWidth / 2;
        const halfHeight = layout.panelHeight / 2;

        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.34);
        shadow.fillRoundedRect(-halfWidth + 6, -halfHeight + 8, layout.panelWidth, layout.panelHeight, Theme.radius.large);

        const plate = this.add.graphics();
        plate.fillStyle(0x0b1c33, 0.88);
        plate.fillRoundedRect(-halfWidth, -halfHeight, layout.panelWidth, layout.panelHeight, Theme.radius.large);
        plate.lineStyle(3, Colors.border, 0.8);
        plate.strokeRoundedRect(-halfWidth, -halfHeight, layout.panelWidth, layout.panelHeight, Theme.radius.large);
        plate.lineStyle(1, 0xffffff, 0.16);
        plate.strokeRoundedRect(-halfWidth + 10, -halfHeight + 10, layout.panelWidth - 20, layout.panelHeight - 20, Theme.radius.large - 6);
        panel.add([shadow, plate]);
        return panel;
    }

    private createMenuActions(layout: ReturnType<MenuScene["getMenuLayout"]>): MenuActionButton[] {
        const definitions = [
            {
                label: "משחק חדש", hint: "בחירת שחקנים ויציאה למסע", glyph: "▶", style: "primary" as const,
                onPress: () => this.scene.start(SceneKeys.PLAYER_SETUP)
            },
            {
                label: "הגדרות", hint: "צלילים, תנועה ונגישות", glyph: "⚙", style: "neutral" as const,
                onPress: () => this.scene.start(SceneKeys.SETTINGS)
            },
            {
                label: "אודות", hint: "מידע קצר על מסע הניקוד", glyph: "i", style: "neutral" as const,
                onPress: () => this.showAbout()
            },
            {
                label: "יציאה מהמשחק", hint: "סגירת התוכנה", glyph: "×", style: "danger" as const,
                onPress: () => this.confirmExit()
            }
        ];

        return definitions.map((definition, index) => new MenuActionButton(this, {
            x: layout.x,
            y: layout.firstButtonY + index * layout.buttonGap,
            width: layout.buttonWidth,
            ...definition
        }).setDepth(30).setAlpha(0));
    }

    private playEntrance(
        badge: BrandBadge,
        hero: Phaser.GameObjects.Container,
        panel: Phaser.GameObjects.Container,
        buttons: MenuActionButton[],
        footer: MenuFooter
    ): void {
        this.cameras.main.fadeIn(300, 7, 20, 38);
        this.tweens.add({ targets: badge, alpha: 1, scale: 1, duration: 420, ease: "Back.Out" });
        this.tweens.add({ targets: hero, alpha: 1, y: 112, duration: 480, ease: "Back.Out" });
        this.tweens.add({ targets: panel, alpha: 1, duration: 420, delay: 90, ease: "Sine.Out" });
        buttons.forEach((button, index) => {
            const targetY = button.y;
            button.y += 18;
            this.tweens.add({
                targets: button,
                alpha: 1,
                y: targetY,
                duration: 340,
                delay: 150 + index * 70,
                ease: "Cubic.Out"
            });
        });
        this.tweens.add({ targets: footer, alpha: 1, duration: 400, delay: 480 });
    }

    private createAmbientBackdrop(width: number, height: number): void {
        const graphics = this.add.graphics().setDepth(-10);
        graphics.fillStyle(0x20c5db, 0.08);
        graphics.fillCircle(width * 0.14, height * 0.18, 180);
        graphics.fillStyle(0x9b62df, 0.10);
        graphics.fillCircle(width * 0.86, height * 0.72, 250);
        graphics.fillStyle(0xf2b93b, 0.06);
        graphics.fillCircle(width * 0.78, height * 0.14, 135);

        const dots: Phaser.GameObjects.Arc[] = [];
        for (let index = 0; index < 9; index += 1) {
            const dot = this.add.circle(70 + index * 145, 185 + (index % 3) * 145, 3 + (index % 2), 0xffffff, 0.22)
                .setDepth(-8);
            dots.push(dot);
        }
        this.tweens.add({ targets: dots, alpha: 0.05, duration: 1600, yoyo: true, repeat: -1, stagger: 120 });
    }

    private showAbout(): void {
        if (this.activeModal) return;
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const overlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.76).setInteractive();
        const panel = this.createGlassPanel(centerX, centerY, 680, 405);
        const titleText = this.add.text(centerX, centerY - 122, "אודות מסע הניקוד", {
            fontFamily: Theme.fonts.family, fontSize: "40px", fontStyle: "bold", color: Colors.yellow, rtl: true
        }).setOrigin(0.5).setDepth(202);
        const bodyText = this.add.text(centerX, centerY - 5,
            "משחק לימודי לתרגול ניקוד עברי בדרך חווייתית. בוחרים שחקנים ולוח, מטילים קובייה, מתקדמים במסלול ועונים על שאלות הקשורות למשבצת שעליה נחת החייל.\n\nמבית מפתחות להצלחה.",
            {
                fontFamily: Theme.fonts.family, fontSize: "23px", color: "#17314D", align: "center", rtl: true,
                wordWrap: { width: 555 }, lineSpacing: 11
            }
        ).setOrigin(0.5).setDepth(202);
        const modal = this.add.container(0, 0, [overlay, panel, titleText, bodyText]).setDepth(200);
        const close = this.createButton(centerX, centerY + 165, "סגירה", () => this.closeActiveModal(), 230, "secondary");
        modal.add(close);
        this.activeModal = modal;
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.closeActiveModal, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.closeActiveModal, this);
    }

    private confirmExit(): void {
        if (this.activeModal) return;
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const overlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.78).setInteractive();
        const panel = this.createGlassPanel(centerX, centerY, 610, 300);
        const title = this.add.text(centerX, centerY - 75, "לצאת מהמשחק?", {
            fontFamily: Theme.fonts.family, fontSize: "38px", fontStyle: "bold", color: `#${Colors.goldDark.toString(16).padStart(6, "0")}`, rtl: true
        }).setOrigin(0.5).setDepth(302);
        const body = this.add.text(centerX, centerY - 10, "המשחק ייסגר כעת.", {
            fontFamily: Theme.fonts.family, fontSize: "23px", color: "#17314D", rtl: true
        }).setOrigin(0.5).setDepth(302);

        const modal = this.add.container(0, 0, [overlay, panel, title, body]).setDepth(300);
        const no = this.createButton(centerX - 130, centerY + 75, "ביטול", () => this.closeActiveModal(), 210, "secondary");
        const yes = this.createButton(centerX + 130, centerY + 75, "יציאה", async () => {
            const closed = await DesktopAppService.quit();
            if (!closed) {
                this.closeActiveModal();
                this.showMessage("סגירה מלאה זמינה בגרסת Windows", "#FFE58A");
            }
        }, 210, "danger");
        modal.add([no, yes]);
        this.activeModal = modal;
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.closeActiveModal, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.closeActiveModal, this);
    }

    private closeActiveModal(): void {
        if (!this.activeModal) return;
        this.activeModal.destroy(true);
        this.activeModal = undefined;
        this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.closeActiveModal, this);
        this.events.off(Phaser.Scenes.Events.DESTROY, this.closeActiveModal, this);
    }
}

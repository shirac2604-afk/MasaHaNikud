declare global {
    interface Window {
        masaDesktop?: {
            isDesktop: boolean;
            quit: () => Promise<void>;
        };
    }
}

export class DesktopAppService {
    public static isDesktop(): boolean {
        return window.masaDesktop?.isDesktop === true;
    }

    public static async quit(): Promise<boolean> {
        if (!DesktopAppService.isDesktop()) return false;
        await window.masaDesktop!.quit();
        return true;
    }
}

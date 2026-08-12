/**
 * Resolves public assets consistently in Vite development and packaged Electron.
 * In Electron the page is loaded with file://, so root-relative URLs such as
 * /assets/... incorrectly point at the drive root. Using document.baseURI keeps
 * every asset relative to dist/index.html.
 */
export function resolvePublicAssetUrl(path: string): string {
    const cleanPath = path.replace(/^\/+/, "");

    if (typeof document === "undefined") return cleanPath;

    try {
        return new URL(cleanPath, document.baseURI).href;
    } catch {
        return cleanPath;
    }
}

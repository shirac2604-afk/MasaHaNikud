const { app, BrowserWindow, globalShortcut, screen, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
    const display = screen.getPrimaryDisplay();

    mainWindow = new BrowserWindow({
        width: display.bounds.width,
        height: display.bounds.height,
        fullscreen: true,
        autoHideMenuBar: true,
        backgroundColor: "#ffffff",
        icon: path.join(__dirname, "..", "build", "icon.png"),
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
    mainWindow.once("ready-to-show", () => mainWindow.show());

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

ipcMain.handle("app:quit", () => {
    app.quit();
});

app.whenReady().then(() => {
    createWindow();

    // F11 מאפשר מעבר בין מסך מלא לחלון לצורכי תחזוקה.
    globalShortcut.register("F11", () => {
        if (mainWindow) {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

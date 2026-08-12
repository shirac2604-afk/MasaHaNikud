const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("masaDesktop", {
    isDesktop: true,
    quit: () => ipcRenderer.invoke("app:quit")
});

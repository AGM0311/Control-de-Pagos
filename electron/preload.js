// Preload de Electron.
// Expone una API mínima y controlada al frontend mediante contextBridge.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  plataforma: process.platform,
  getVersion: () => ipcRenderer.invoke("app:version"),
  checkForUpdates: () => ipcRenderer.invoke("app:check-updates"),
  installUpdate: () => ipcRenderer.invoke("app:install-update"),
  onUpdateStatus: (callback) => {
    ipcRenderer.on("update-status", (_event, payload) => callback(payload));
  },
});

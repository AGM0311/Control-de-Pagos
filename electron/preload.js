// Preload de Electron. Por ahora la app no expone APIs de Electron al frontend
// (todo se comunica por HTTP con el backend local). Se mantiene por si en el
// futuro necesitas exponer algo de forma controlada mediante contextBridge.
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("appInfo", {
  plataforma: process.platform,
  version: process.env.npm_package_version || "0.0.0",
});

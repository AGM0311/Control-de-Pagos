// Proceso principal de Electron.
// Inicia el backend (Express) en el mismo proceso y abre una ventana que
// carga el frontend. En producción el propio backend sirve la carpeta `build/`
// en http://localhost:3001, así que frontend y backend comparten origen.

const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

// Guardar datos y archivos subidos fuera del ejecutable (el .asar es de solo
// lectura). Se usa la carpeta de datos del usuario del sistema operativo.
process.env.DATA_DIR = path.join(app.getPath("userData"), "data");
process.env.UPLOADS_DIR = path.join(app.getPath("userData"), "uploads");

// Arranca el servidor Express (usa la URL de la app empaquetada).
const { startServer, crearBackup } = require("../server");
startServer();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    backgroundColor: "#f5f6f8",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (app.isPackaged) {
    // El backend sirve el frontend compilado.
    mainWindow.loadURL("http://localhost:3001");
  } else {
    // En desarrollo carga el dev server de React (npm start).
    mainWindow.loadURL(process.env.ELECTRON_START_URL || "http://localhost:3000");
  }

  // Los enlaces externos se abren en el navegador del sistema.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ---------------------------------------------------------------- IPC

function enviarEstadoActualizacion(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-status", payload);
  }
}

ipcMain.handle("app:version", () => app.getVersion());

ipcMain.handle("app:check-updates", async () => {
  if (!app.isPackaged) {
    return { ok: false, mensaje: "Las actualizaciones solo funcionan en la app instalada." };
  }
  try {
    const resultado = await autoUpdater.checkForUpdates();
    return { ok: true, version: resultado?.updateInfo?.version || null };
  } catch (err) {
    return { ok: false, mensaje: err?.message || String(err) };
  }
});

ipcMain.handle("app:install-update", () => {
  autoUpdater.quitAndInstall(false, true);
  return { ok: true };
});

// Eventos del auto-updater → interfaz.
autoUpdater.on("checking-for-update", () => enviarEstadoActualizacion({ channel: "checking" }));
autoUpdater.on("update-available", (info) => enviarEstadoActualizacion({ channel: "available", data: info }));
autoUpdater.on("update-not-available", (info) => enviarEstadoActualizacion({ channel: "not-available", data: info }));
autoUpdater.on("download-progress", (p) => enviarEstadoActualizacion({ channel: "progress", data: p }));
autoUpdater.on("update-downloaded", (info) => enviarEstadoActualizacion({ channel: "downloaded", data: info }));
autoUpdater.on("error", (err) => enviarEstadoActualizacion({ channel: "error", data: err?.message || String(err) }));

// ---------------------------------------------------------------- arranque

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Auto-actualización: solo en la app empaquetada.
  if (app.isPackaged) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.error("Error al buscar actualizaciones:", err);
    });
  }

  // Respaldo automático periódico (cada 12 horas mientras la app está abierta).
  // Además del respaldo que ya se hace al arrancar.
  setInterval(() => {
    try {
      crearBackup();
      console.log("Respaldo automático periódico creado.");
    } catch (err) {
      console.error("Error en el respaldo periódico:", err);
    }
  }, 12 * 60 * 60 * 1000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

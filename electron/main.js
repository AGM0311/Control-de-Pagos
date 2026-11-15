// Proceso principal de Electron.
// Inicia el backend (Express) en el mismo proceso y abre una ventana que
// carga el frontend. En producción el propio backend sirve la carpeta `build/`
// en http://localhost:3001, así que frontend y backend comparten origen.

const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

// Guardar datos y archivos subidos fuera del ejecutable (el .asar es de solo
// lectura). Se usa la carpeta de datos del usuario del sistema operativo.
process.env.DATA_DIR = path.join(app.getPath("userData"), "data");
process.env.UPLOADS_DIR = path.join(app.getPath("userData"), "uploads");

// Arranca el servidor Express (usa la URL de la app empaquetada).
const { startServer } = require("../server");
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
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

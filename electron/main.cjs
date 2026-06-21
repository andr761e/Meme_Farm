const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

function createWindow() {
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 680,
    backgroundColor: "#080914",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
      sandbox: true
    }
  });

  window.loadFile(path.join(__dirname, "..", "src", "index.html"));
}

function getSaveFilePath() {
  return path.join(app.getPath("userData"), "saves", "meme-farm-save.json");
}

function installSaveIpc() {
  ipcMain.on("meme-farm-save:load", (event) => {
    try {
      const savePath = getSaveFilePath();
      event.returnValue = fs.existsSync(savePath) ? fs.readFileSync(savePath, "utf8") : null;
    } catch {
      event.returnValue = null;
    }
  });

  ipcMain.on("meme-farm-save:write", (event, saveText) => {
    try {
      const savePath = getSaveFilePath();
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
      fs.writeFileSync(savePath, String(saveText), "utf8");
      event.returnValue = true;
    } catch {
      event.returnValue = false;
    }
  });

  ipcMain.on("meme-farm-save:clear", (event) => {
    try {
      const savePath = getSaveFilePath();
      if (fs.existsSync(savePath)) {
        fs.unlinkSync(savePath);
      }
      event.returnValue = true;
    } catch {
      event.returnValue = false;
    }
  });
}

app.whenReady().then(() => {
  installSaveIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

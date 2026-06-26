const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, screen } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_DESKTOP_COMPANION_SETTINGS = {
  enabled: true,
  trayStatus: true,
  taskbarFlash: true,
  offlineReports: true,
  titleMischief: true
};
const CANONICAL_CONTENT_SIZE = {
  width: 1920,
  height: 1080
};
const DEFAULT_DESKTOP_WINDOW_PRESET_ID = "1280x720";
const DESKTOP_WINDOW_PRESETS = [
  { id: "fullscreen", label: "Fullscreen", fullscreen: true },
  { id: "1152x648", label: "1152 x 648", width: 1152, height: 648 },
  { id: "1280x720", label: "1280 x 720", width: 1280, height: 720 },
  { id: "1366x768", label: "1366 x 768", width: 1366, height: 768 },
  { id: "1440x810", label: "1440 x 810", width: 1440, height: 810 },
  { id: "1600x900", label: "1600 x 900", width: 1600, height: 900 },
  { id: "1920x1080", label: "1920 x 1080", width: 1920, height: 1080 }
];
const DEFAULT_DESKTOP_WINDOW_SETTINGS = {
  sizePreset: DEFAULT_DESKTOP_WINDOW_PRESET_ID
};
const MIN_WINDOW_SIZE = {
  width: 640,
  height: 360
};
const DEFAULT_TRAY_STATUS = {
  likes: "0",
  lps: "0",
  subscribers: "0",
  era: "Basement Posting",
  towers: "0"
};

let mainWindow = null;
let tray = null;
let desktopCompanionSettings = { ...DEFAULT_DESKTOP_COMPANION_SETTINGS };
let desktopWindowSettings = { ...DEFAULT_DESKTOP_WINDOW_SETTINGS };
let latestTrayStatus = { ...DEFAULT_TRAY_STATUS };
let windowBoundsSaveTimer = null;

if (process.platform === "win32") {
  app.setAppUserModelId("com.memefarm.game");
}

function createWindow() {
  desktopWindowSettings = readDesktopWindowSettings();
  const windowBounds = readWindowBounds(desktopWindowSettings);
  mainWindow = new BrowserWindow({
    ...windowBounds,
    minWidth: MIN_WINDOW_SIZE.width,
    minHeight: MIN_WINDOW_SIZE.height,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    fullscreen: isFullscreenPreset(desktopWindowSettings.sizePreset),
    backgroundColor: "#080914",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
      sandbox: true
    }
  });

  mainWindow.setResizable(false);
  mainWindow.setMaximizable(false);
  applyDesktopWindowZoom(desktopWindowSettings);
  mainWindow.loadFile(path.join(__dirname, "..", "src", "index.html"));
  mainWindow.webContents.on("did-finish-load", () => {
    applyDesktopWindowZoom(desktopWindowSettings);
  });
  mainWindow.on("focus", () => {
    mainWindow.flashFrame(false);
  });
  mainWindow.on("enter-full-screen", () => {
    scheduleDesktopWindowZoom();
  });
  mainWindow.on("leave-full-screen", () => {
    scheduleDesktopWindowZoom();
  });
  mainWindow.on("resize", scheduleWindowBoundsSave);
  mainWindow.on("move", scheduleWindowBoundsSave);
  mainWindow.on("close", saveWindowBoundsNow);
  mainWindow.on("closed", () => {
    saveWindowBoundsNow();
    mainWindow = null;
  });
}

function getSaveFilePath() {
  return path.join(app.getPath("userData"), "saves", "meme-farm-save.json");
}

function getWindowBoundsFilePath() {
  return path.join(app.getPath("userData"), "window-bounds.json");
}

function getWindowSettingsFilePath() {
  return path.join(app.getPath("userData"), "window-settings.json");
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

function readDesktopWindowSettings() {
  try {
    const settingsPath = getWindowSettingsFilePath();
    const savedSettings = fs.existsSync(settingsPath)
      ? JSON.parse(fs.readFileSync(settingsPath, "utf8"))
      : null;
    return normalizeDesktopWindowSettings(savedSettings);
  } catch {
    return { ...DEFAULT_DESKTOP_WINDOW_SETTINGS };
  }
}

function saveDesktopWindowSettingsNow() {
  try {
    const settingsPath = getWindowSettingsFilePath();
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify(desktopWindowSettings, null, 2), "utf8");
  } catch {
    // Window mode is convenience state; failing to persist it should never block the game.
  }
}

function readWindowBounds(windowSettings = desktopWindowSettings) {
  try {
    const boundsPath = getWindowBoundsFilePath();
    const savedBounds = fs.existsSync(boundsPath)
      ? JSON.parse(fs.readFileSync(boundsPath, "utf8"))
      : null;
    return normalizeWindowBounds(savedBounds, windowSettings);
  } catch {
    return normalizeWindowBounds(null, windowSettings);
  }
}

function normalizeWindowBounds(bounds, windowSettings = desktopWindowSettings) {
  const dimensions = getWindowDimensions(windowSettings.sizePreset);
  const width = Math.max(MIN_WINDOW_SIZE.width, dimensions.width);
  const height = Math.max(MIN_WINDOW_SIZE.height, dimensions.height);
  const nextBounds = {
    width,
    height
  };

  if (Number.isFinite(bounds?.x) && Number.isFinite(bounds?.y)) {
    nextBounds.x = Math.floor(bounds.x);
    nextBounds.y = Math.floor(bounds.y);
  }

  return ensureWindowBoundsVisible(nextBounds);
}

function ensureWindowBoundsVisible(bounds) {
  const displays = screen.getAllDisplays();
  const visibleBounds = displays.some((display) => intersects(bounds, display.workArea));

  if (Number.isFinite(bounds.x) && Number.isFinite(bounds.y) && visibleBounds) {
    return bounds;
  }

  const workArea = screen.getPrimaryDisplay().workArea;
  return {
    ...bounds,
    x: Math.round(workArea.x + workArea.width - bounds.width - 32),
    y: Math.round(workArea.y + (workArea.height - bounds.height) / 2)
  };
}

function intersects(first, second) {
  if (!Number.isFinite(first.x) || !Number.isFinite(first.y)) {
    return false;
  }

  return first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y;
}

function scheduleWindowBoundsSave() {
  clearTimeout(windowBoundsSaveTimer);
  windowBoundsSaveTimer = setTimeout(saveWindowBoundsNow, 500);
}

function saveWindowBoundsNow() {
  clearTimeout(windowBoundsSaveTimer);
  windowBoundsSaveTimer = null;

  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  try {
    const boundsPath = getWindowBoundsFilePath();
    const bounds = mainWindow.isFullScreen() ? mainWindow.getNormalBounds() : mainWindow.getBounds();
    const dimensions = getWindowDimensions(desktopWindowSettings.sizePreset);
    const payload = {
      width: dimensions.width,
      height: dimensions.height
    };

    if (Number.isFinite(bounds.x) && Number.isFinite(bounds.y)) {
      payload.x = Math.floor(bounds.x);
      payload.y = Math.floor(bounds.y);
    }

    fs.mkdirSync(path.dirname(boundsPath), { recursive: true });
    fs.writeFileSync(boundsPath, JSON.stringify(payload, null, 2), "utf8");
  } catch {
    // Window position is convenience state; failing to persist it should never block the game.
  }
}

function applyDesktopWindowZoom(settings) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  if (isFullscreenPreset(settings.sizePreset)) {
    mainWindow.webContents.setZoomFactor(1);
    applyDesktopFitMode(true);
    return;
  }

  applyDesktopFitMode(false);
  mainWindow.webContents.setZoomFactor(getWindowZoomFactor(settings.sizePreset));
}

function scheduleDesktopWindowZoom() {
  setTimeout(() => {
    applyDesktopWindowZoom(desktopWindowSettings);
  }, 80);
}

function applyDesktopFitMode(enabled) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const scale = enabled ? getWindowZoomFactor("fullscreen") : 1;
  const script = `
    (() => {
      const root = document.documentElement;
      root.classList.toggle("desktop-fit-mode", ${JSON.stringify(Boolean(enabled))});
      root.style.setProperty("--desktop-fit-scale", ${JSON.stringify(String(scale))});
    })();
  `;

  mainWindow.webContents.executeJavaScript(script).catch(() => {
    // The page may still be loading; the next scheduled/apply pass will catch it.
  });
}

function applyDesktopWindowSettings(settings) {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  mainWindow.setResizable(false);
  mainWindow.setMaximizable(false);

  if (isFullscreenPreset(settings.sizePreset)) {
    saveWindowBoundsNow();
    const display = screen.getDisplayMatching(mainWindow.getBounds());
    mainWindow.setResizable(true);
    mainWindow.setBounds(display.bounds);
    mainWindow.setFullScreen(true);
    mainWindow.setResizable(false);
    scheduleDesktopWindowZoom();
    return;
  }

  const applyFixedBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      return;
    }

    const currentBounds = mainWindow.getNormalBounds();
    const dimensions = getWindowDimensions(settings.sizePreset);
    const nextBounds = ensureWindowBoundsVisible({
      ...currentBounds,
      width: dimensions.width,
      height: dimensions.height
    });

    mainWindow.setResizable(false);
    mainWindow.setMaximizable(false);
    applyDesktopWindowZoom(settings);
    mainWindow.setContentSize(dimensions.width, dimensions.height);
    mainWindow.setPosition(nextBounds.x, nextBounds.y);
    saveWindowBoundsNow();
  };

  if (mainWindow.isFullScreen()) {
    mainWindow.once("leave-full-screen", applyFixedBounds);
    mainWindow.setFullScreen(false);
    return;
  }

  applyFixedBounds();
}

function installDesktopCompanionIpc() {
  ipcMain.on("meme-farm-desktop:configure", (_event, settings) => {
    desktopCompanionSettings = normalizeDesktopCompanionSettings(settings);
    syncTray();
  });

  ipcMain.on("meme-farm-desktop:status", (_event, status) => {
    latestTrayStatus = normalizeTrayStatus(status);
    syncTray();
  });

  ipcMain.on("meme-farm-desktop:flash", () => {
    flashMainWindow();
  });
}

function installDesktopWindowIpc() {
  ipcMain.on("meme-farm-window:configure", (_event, settings) => {
    desktopWindowSettings = normalizeDesktopWindowSettings(settings);
    saveDesktopWindowSettingsNow();
    applyDesktopWindowSettings(desktopWindowSettings);
  });
}

function normalizeDesktopCompanionSettings(settings) {
  if (!settings || typeof settings !== "object") {
    return { ...DEFAULT_DESKTOP_COMPANION_SETTINGS };
  }

  return Object.fromEntries(
    Object.entries(DEFAULT_DESKTOP_COMPANION_SETTINGS).map(([key, defaultValue]) => [
      key,
      Boolean(settings[key] ?? defaultValue)
    ])
  );
}

function normalizeDesktopWindowSettings(settings) {
  const sizePreset = getWindowPreset(settings?.sizePreset).id;
  return { sizePreset };
}

function getWindowPreset(sizePreset) {
  return DESKTOP_WINDOW_PRESETS.find((preset) => preset.id === sizePreset) ??
    DESKTOP_WINDOW_PRESETS.find((preset) => preset.id === DEFAULT_DESKTOP_WINDOW_PRESET_ID);
}

function getWindowDimensions(sizePreset) {
  const preset = getWindowPreset(sizePreset);
  const normalPreset = preset.fullscreen
    ? getWindowPreset(DEFAULT_DESKTOP_WINDOW_PRESET_ID)
    : preset;

  return {
    width: Math.max(MIN_WINDOW_SIZE.width, normalPreset.width),
    height: Math.max(MIN_WINDOW_SIZE.height, normalPreset.height)
  };
}

function getWindowZoomFactor(sizePreset) {
  if (isFullscreenPreset(sizePreset)) {
    const dimensions = getFullscreenContentDimensions();
    return Math.min(
      dimensions.width / CANONICAL_CONTENT_SIZE.width,
      dimensions.height / CANONICAL_CONTENT_SIZE.height
    );
  }

  const dimensions = getWindowDimensions(sizePreset);
  return Math.min(
    dimensions.width / CANONICAL_CONTENT_SIZE.width,
    dimensions.height / CANONICAL_CONTENT_SIZE.height
  );
}

function getFullscreenContentDimensions() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const contentBounds = mainWindow.getContentBounds();

    if (mainWindow.isFullScreen() && contentBounds.width > 0 && contentBounds.height > 0) {
      return {
        width: contentBounds.width,
        height: contentBounds.height
      };
    }

    const display = screen.getDisplayMatching(mainWindow.getBounds());
    return {
      width: display.workArea.width,
      height: display.workArea.height
    };
  }

  const display = screen.getPrimaryDisplay();
  return {
    width: display.workArea.width,
    height: display.workArea.height
  };
}

function isFullscreenPreset(sizePreset) {
  return Boolean(getWindowPreset(sizePreset).fullscreen);
}

function normalizeTrayStatus(status) {
  if (!status || typeof status !== "object") {
    return { ...DEFAULT_TRAY_STATUS };
  }

  return Object.fromEntries(
    Object.entries(DEFAULT_TRAY_STATUS).map(([key, defaultValue]) => [
      key,
      String(status[key] ?? defaultValue).slice(0, 80)
    ])
  );
}

function syncTray() {
  if (!desktopCompanionSettings.enabled || !desktopCompanionSettings.trayStatus) {
    destroyTray();
    return;
  }

  if (!tray) {
    tray = new Tray(getTrayIcon());
    tray.on("click", showMainWindow);
    tray.on("double-click", showMainWindow);
  }

  const tooltip = [
    "Meme Farm is still posting.",
    `${latestTrayStatus.likes} Likes`,
    `${latestTrayStatus.lps} LPS`,
    `${latestTrayStatus.subscribers} Subscribers`,
    `${latestTrayStatus.era} era`
  ].join("\n");

  tray.setToolTip(tooltip);
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: "Open Meme Farm",
      click: showMainWindow
    },
    {
      label: `${latestTrayStatus.likes} Likes`,
      enabled: false
    },
    {
      label: `${latestTrayStatus.lps} LPS`,
      enabled: false
    },
    {
      label: `${latestTrayStatus.subscribers} Subscribers`,
      enabled: false
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => app.quit()
    }
  ]));
}

function destroyTray() {
  if (!tray) {
    return;
  }

  tray.destroy();
  tray = null;
}

function getTrayIcon() {
  const iconPath = path.join(__dirname, "..", "assets", "images", "meme-button", "meme-button.png");
  const icon = nativeImage.createFromPath(iconPath);
  return icon.isEmpty() ? nativeImage.createEmpty() : icon.resize({ width: 16, height: 16 });
}

function flashMainWindow() {
  if (!desktopCompanionSettings.enabled || !desktopCompanionSettings.taskbarFlash || !mainWindow) {
    return;
  }

  mainWindow.flashFrame(true);
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.flashFrame(false);
    }
  }, 3600);
}

function showMainWindow() {
  if (!mainWindow) {
    createWindow();
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
}

app.whenReady().then(() => {
  installSaveIpc();
  installDesktopCompanionIpc();
  installDesktopWindowIpc();
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

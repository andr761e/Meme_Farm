const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("memeFarmPlatform", {
  save: {
    load() {
      return ipcRenderer.sendSync("meme-farm-save:load");
    },
    write(saveText) {
      return ipcRenderer.sendSync("meme-farm-save:write", saveText);
    },
    clear() {
      return ipcRenderer.sendSync("meme-farm-save:clear");
    }
  },
  desktop: {
    available: true,
    configure(settings) {
      ipcRenderer.send("meme-farm-desktop:configure", settings);
    },
    configureWindow(settings) {
      ipcRenderer.send("meme-farm-window:configure", settings);
    },
    updateStatus(status) {
      ipcRenderer.send("meme-farm-desktop:status", status);
    },
    flash() {
      ipcRenderer.send("meme-farm-desktop:flash");
    }
  },
  steam: {
    getStatus() {
      return ipcRenderer.invoke("meme-farm-steam:status");
    },
    queueScores(scores) {
      return ipcRenderer.invoke("meme-farm-steam:queue-scores", scores);
    },
    getLeaderboard(request) {
      return ipcRenderer.invoke("meme-farm-steam:get-leaderboard", request);
    },
    onLeaderboardUpdated(callback) {
      if (typeof callback !== "function") {
        return () => {};
      }

      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on("meme-farm-steam:leaderboard-updated", listener);
      return () => ipcRenderer.removeListener("meme-farm-steam:leaderboard-updated", listener);
    }
  }
});

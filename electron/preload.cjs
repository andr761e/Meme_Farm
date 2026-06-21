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
  steam: {
    available: false
  }
});

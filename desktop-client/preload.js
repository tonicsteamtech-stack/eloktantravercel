const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("secureAPI", {
  onViolation: (callback) => {
    ipcRenderer.on("violation", (_event, reason) => callback(reason))
  }
})

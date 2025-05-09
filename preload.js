const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onTopAppsUpdate: (callback) => ipcRenderer.on('update-top-apps', (event, data) => callback(data)),
  onActiveAppChange: (callback) => ipcRenderer.on('active-app-name', (event, appName) => callback(appName))
});

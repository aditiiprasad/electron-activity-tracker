// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // For receiving data from main process
  onTopAppsUpdate: (callback) => ipcRenderer.on('update-top-apps', (event, data) => callback(data)),
  onActiveAppChange: (callback) => ipcRenderer.on('active-app-name', (event, appName) => callback(appName)),
  
  // For sending activity data to main process for storage
  saveMouseActivity: (data) => ipcRenderer.send('save-mouse-activity', data),
  saveKeyboardActivity: (data) => ipcRenderer.send('save-keyboard-activity', data),
  saveScrollActivity: (data) => ipcRenderer.send('save-scroll-activity', data)
});

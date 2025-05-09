const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('activityAPI', {
  logActivity: (activity) => ipcRenderer.send('log-activity', activity),
  onActivity: (callback) => ipcRenderer.on('activity', (_e, activity) => callback(activity)) 
});

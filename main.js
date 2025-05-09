const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');

  (async () => {
    try {
      const activeWinModule = await import('active-win');
      const activeWindowSync = activeWinModule.activeWindowSync;
      const appUsage = {};
      let lastAppName = null;

      setInterval(() => {
        const aw = activeWindowSync();
        if (aw && aw.owner && aw.owner.name) {
          const appName = aw.owner.name;

          // Track usage
          appUsage[appName] = (appUsage[appName] || 0) + 1;

          // Log change only if the active app has changed
          if (appName !== lastAppName) {
            win.webContents.send('active-app-name', appName);
            lastAppName = appName;
          }

          // Send top 3 used apps
          const topApps = Object.entries(appUsage)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, time]) => ({ name, time }));
          win.webContents.send('update-top-apps', topApps);
        }
      }, 1000);
    } catch (err) {
      console.error('Failed to load active-win:', err);
    }
  })();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

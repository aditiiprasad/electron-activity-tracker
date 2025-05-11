// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Path for storing activity logs
const dataFilePath = path.join(app.getPath('userData'), 'activity-logs.json');

// Initialize data file if it doesn't exist
function initDataFile() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
    console.log('Created new activity log file at:', dataFilePath);
  }
}

// Save activity to file
function saveActivity(type, data) {
  try {
    let activities = [];
    // Read existing data
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      activities = JSON.parse(fileContent);
    }
    
    // Add new activity with timestamp
    activities.push({
      type,
      data,
      timestamp: new Date().toISOString(),
    });
    
    // Write back to file
    fs.writeFileSync(dataFilePath, JSON.stringify(activities, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving activity:', error);
  }
}

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
            // Save to file
            saveActivity('window', { appName });
            
            // Send to renderer
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

// Set up IPC listeners for activity logging
ipcMain.on('save-mouse-activity', (event, data) => {
  saveActivity('mouse', data);
});

ipcMain.on('save-keyboard-activity', (event, data) => {
  saveActivity('keyboard', data);
});

ipcMain.on('save-scroll-activity', (event, data) => {
  saveActivity('scroll', data);
});

// Initialize and create window when app is ready
app.whenReady().then(() => {
  initDataFile();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    initDataFile();
    createWindow();
  }
});
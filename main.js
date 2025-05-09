const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let activeWin; 
let previousActiveWindow = null; 

// Path for the log file
const logFilePath = path.join(app.getPath('userData'), 'activity-log.json');

let mainWindow;

// Function to log the currently active window
async function trackActiveWindow() {
  try {
    if (!activeWin) return;

    const active = await activeWin();
    if (!active) {
      console.log('No active window detected.');
      return;
    }

    // Compare current active window with the previous one
    if (
      !previousActiveWindow || 
      active.owner.name !== previousActiveWindow.owner.name || 
      active.title !== previousActiveWindow.title 
    ) {
      const activity = {
        type: 'active-window',
        details: `App: ${active.owner.name}, Title: ${active.title}`,
        timestamp: new Date().toISOString()
      };

      console.log('Tracked active-window:', activity); 

      
      fs.appendFileSync(logFilePath, JSON.stringify(activity) + '\n');


      if (mainWindow) {
        mainWindow.webContents.send('activity', activity);
      }

      
      previousActiveWindow = active;
    }
  } catch (err) {
    console.error('Error tracking active window:', err);
  }
}

// Handle activity events from renderer (like mouse clicks, scrolls, etc.)
ipcMain.on('log-activity', (event, activity) => {
  try {
    fs.appendFileSync(logFilePath, JSON.stringify(activity) + '\n');
  } catch (err) {
    console.error('Error writing activity log:', err);
  }
});

// Electron window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

// Initialize app
app.whenReady().then(async () => {
  const activeWinModule = await import('active-win');
  activeWin = activeWinModule.activeWindow;

  createWindow();

  //  tracking active window every 1 seconds
  setInterval(trackActiveWindow, 1000); 

  console.log('User‑data path:', app.getPath('userData'));
});

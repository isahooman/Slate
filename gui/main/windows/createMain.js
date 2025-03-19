const { BrowserWindow } = require('electron');
const path = require('path');

/**
 * Creates the main window
 * @returns {BrowserWindow} the main window
 */
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    minWidth: 475,
    minHeight: 500,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  });

  // Open dev tools in a dev environment
  if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.loadFile(path.join(__dirname, '../../app/html/main.html'));

  return mainWindow;
}

module.exports = { createMainWindow };

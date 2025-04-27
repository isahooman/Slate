const { BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;

/**
 * Creates the main application window
 * @param {object} options - Additional window options
 * @returns {BrowserWindow} The main window instance
 * @author isahooman
 */
function createMainWindow(options = {}) {
  // Return existing window if it's already created
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return mainWindow;
  }

  // Create the main window with standard options
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    minWidth: 500,
    minHeight: 500,
    frame: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    },
    ...options,
  });

  // Open dev tools in a dev environment
  if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Load main HTML
  mainWindow.loadFile(path.join(__dirname, '../../app/html/main.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Cleanup when closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

module.exports = { createMainWindow };

const { BrowserWindow, screen } = require('electron');
const path = require('path');

let settingsWindow = null;
const width = 500;
const height = 500;

function CenterWindow(parentWindow) {
  let position;
  // Center to parent window if provided
  if (parentWindow) {
    const parentBounds = parentWindow.getBounds();
    const parentDisplay = screen.getDisplayMatching(parentBounds);
    const workArea = parentDisplay.workArea;

    // Center to parent window
    position = {
      x: Math.floor(parentBounds.x + (parentBounds.width - width) / 2),
      y: Math.floor(parentBounds.y + (parentBounds.height - height) / 2),
    };

    // Keep window on screen
    position.x = Math.max(workArea.x, Math.min(position.x, workArea.x + workArea.width - width));
    position.y = Math.max(workArea.y, Math.min(position.y, workArea.y + workArea.height - height));
  } else {
    // Center to primary display if no parent window
    const primaryDisplay = screen.getPrimaryDisplay();
    const workArea = primaryDisplay.workArea;
    position = {
      x: Math.floor(workArea.x + (workArea.width - width) / 2),
      y: Math.floor(workArea.y + (workArea.height - height) / 2),
    };
  }
  return position;
}

function createSettingsWindow() {
  const mainWindow = BrowserWindow.fromId(1);

  // calc window position
  const { x, y } = CenterWindow(mainWindow);

  // create setting window
  settingsWindow = new BrowserWindow({
    width: width,
    height: height,
    x,
    y,
    frame: false,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  });

  settingsWindow.loadFile(path.join(__dirname, '../../app/html/settings.html'));
  settingsWindow.webContents.once('did-finish-load', () => {
    settingsWindow.show();
  });

  // Cleanup when closed
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
}

module.exports = { createSettingsWindow };

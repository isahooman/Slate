const { BrowserWindow, screen } = require('electron');
const path = require('path');

let alertWindow = null;
const width = 300;
const height = 200;

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

function createAlertWindow(parentWindow, message) {
  // If alert window already exists focus on it and update the message
  if (alertWindow) {
    alertWindow.focus();
    alertWindow.webContents.send('alert:message', message);
    return alertWindow;
  }

  // Calculate window position
  const { x, y } = CenterWindow(parentWindow);

  // Create the alert window
  alertWindow = new BrowserWindow({
    width: width,
    height: height,
    minHeight: height,
    minWidth: width,
    x,
    y,
    frame: false,
    transparent: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    movable: false,
    parent: parentWindow || undefined,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  });

  alertWindow.loadFile(path.join(__dirname, '../../app/html/alert.html'));

  // Once loaded, show window and prepare message
  alertWindow.webContents.once('did-finish-load', () => {
    alertWindow.webContents.send('alert:message', message);
    alertWindow.show();
  });

  // Cleanup when closed
  alertWindow.on('closed', () => {
    alertWindow = null;
  });

  return alertWindow;
}

module.exports = { createAlertWindow };

const { BrowserWindow, screen } = require('electron');
const path = require('path');

let settingsWindow = null;
const width = 500;
const height = 500;

/**
 * Centers a window relative to parent or on screen
 * @param {BrowserWindow} parentWindow - Parent window to center against
 * @returns {object} The x,y position coordinates
 */
function centerWindow(parentWindow) {
  let position;

  // Center to parent window if provided
  if (parentWindow && !parentWindow.isDestroyed()) {
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

/**
 * Creates the settings window
 * @param {BrowserWindow} parentWindow - Parent window reference
 * @param {object} options - Additional window options
 * @returns {BrowserWindow} The settings window instance
 */
function createSettingsWindow(parentWindow, options = {}) {
  // Return existing window if it's already created
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) settingsWindow.restore();
    settingsWindow.focus();
    return settingsWindow;
  }

  // Default to main window if no parent provided
  const mainWindow = parentWindow || BrowserWindow.fromId(1);

  // Check if parent window is pinned
  const isMainWindowPinned = mainWindow && !mainWindow.isDestroyed() ?
    mainWindow.isAlwaysOnTop() : false;

  // Calculate window position
  const { x, y } = centerWindow(mainWindow);

  // Create settings window
  settingsWindow = new BrowserWindow({
    width: width,
    height: height,
    x,
    y,
    frame: false,
    resizable: false,
    show: false,
    parent: mainWindow || undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    },
    ...options,
  });

  // Mirror pin state of main window
  if (isMainWindowPinned) settingsWindow.setAlwaysOnTop(true, 'pop-up-menu', 1);

  // Load settings HTML
  settingsWindow.loadFile(path.join(__dirname, '../../app/html/settings.html'));

  // Initialize window when loaded
  settingsWindow.webContents.once('did-finish-load', () => {
    // Send pin state to the settings window
    settingsWindow.webContents.send('window-state-changed', {
      type: 'pin',
      pinned: isMainWindowPinned,
      iconPath: isMainWindowPinned ? '../../assets/pin_off.svg' : '../../assets/pin.svg',
    });

    settingsWindow.show();
  });

  // Cleanup when closed
  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
}

module.exports = { createSettingsWindow };

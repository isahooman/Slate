const { BrowserWindow } = require('electron');
const { createMainWindow } = require('./createMain');
const { createSettingsWindow } = require('./createSettings');
const { createAlertWindow } = require('./createAlert');
class WindowManager {
  constructor() {
    // Store window instance with IDs
    this.windows = new Map();
  }

  /**
   * Retrieve window instance
   * @param {string} windowId - window id
   * @returns {BrowserWindow|undefined} the window instance
   * @author isahooman
   */
  getWindow(windowId) {
    return this.windows.get(windowId);
  }

  /**
   * Checks if a window exists
   * @param {string} windowId - window id
   * @returns {boolean} true if the window exists
   * @author isahooman
   */
  windowExists(windowId) {
    const window = this.getWindow(windowId);
    return window && !window.isDestroyed();
  }

  /**
   * Focuses a window and restores it if minimized
   * @param {string} windowId - window id
   * @returns {boolean} true if focused
   * @author isahooman
   */
  focusWindow(windowId) {
    const window = this.getWindow(windowId);
    if (this.windowExists(windowId)) {
      if (window.isMinimized()) window.restore();
      window.focus();
      return true;
    }
    return false;
  }

  /**
   * Creates a window of given type
   * @param {string} type - The type of window to create
   * @param {BrowserWindow|null} parentWebContents - parent window
   * @param {object} options - additional options
   * @returns {BrowserWindow} the window instance
   * @author isahooman
   */
  createWindow(type, parentWebContents = null, options = {}) {
    if (this.windowExists(type)) return this.focusWindow(type);

    let window;
    const parentWindow = parentWebContents instanceof BrowserWindow ?
      parentWebContents :
      parentWebContents ? BrowserWindow.fromWebContents(parentWebContents) : null;

    const commonOptions = {
      parent: parentWindow,
      ...options,
    };

    // Create window based on type
    switch (type) {
      case 'main':
        window = createMainWindow(commonOptions);
        this.setupWindow('main', window);
        break;

      case 'settings':
        window = createSettingsWindow(parentWindow);
        this.setupWindow('settings', window, true);
        break;

      case 'alert':
        window = createAlertWindow(parentWindow, options.message);
        this.setupWindow('alert', window, true);
        break;
    }

    return window;
  }

  /**
   * Set up window event handlers
   * @param {string} windowId - window ID
   * @param {BrowserWindow} window - window instance
   * @author isahooman
   */
  setupWindow(windowId, window = false) {
    this.windows.set(windowId, window);

    // Set initial pin state
    window.webContents.on('did-finish-load', () => {
      window.webContents.send('window-state-changed', {
        type: 'pin',
        pinned: window.isAlwaysOnTop(),
        iconPath: window.isAlwaysOnTop() ? '../../assets/pin_off.svg' : '../../assets/pin.svg',
      });
    });

    // Close all windows if the main window is closed
    if (windowId === 'main') window.on('close', () => {
      for (const [id, win] of this.windows) if (id !== 'main' && !win.isDestroyed()) win.close();
    });
  }

  /**
   * Closes a specific window
   * @param {string} windowId - ID of target window
   * @author isahooman
   */
  closeWindow(windowId) {
    const window = this.getWindow(windowId);
    if (window && !window.isDestroyed()) {
      if (windowId === 'main') this.closeAllWindows();

      window.close();
      this.windows.delete(windowId);
    }
  }

  /**
   * Closes all windows
   * @author isahooman
   */
  closeAllWindows() {
    for (const [windowId] of this.windows) this.closeWindow(windowId);
  }

  /**
   * Gets the current state of a window
   * @param {string} windowId - Window ID
   * @returns {object|null} Window state
   * @author isahooman
   */
  getWindowState(windowId) {
    const window = this.windows.get(windowId);
    if (!window) return null;

    return {
      isPinned: window.isAlwaysOnTop(),
      iconPath: window.isAlwaysOnTop() ? '../../assets/pin_off.svg' : '../../assets/pin.svg',
      isMain: window.isMain,
      bounds: window.getBounds(),
    };
  }
}

module.exports = WindowManager;

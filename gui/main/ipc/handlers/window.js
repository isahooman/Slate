const { BrowserWindow } = require('electron');
const WindowManager = require('../../windows/windowManager');

class WindowControlsManager {
  constructor() {
    this.windowState = new Map();
    this.pinIconPath = {
      pinned: '../../assets/pin_off.svg',
      unpinned: '../../assets/pin.svg',
    };
    this.windowManager = new WindowManager();
  }

  handleControl(event, command) {
    const window = BrowserWindow.fromWebContents(event.sender);
    const actions = {
      minimize: () => window.minimize(),
      maximize: () => this.handleMaximize(window),
      close: () => window.close(),
    };

    if (actions[command]) actions[command]();
  }

  handleMaximize(window) {
    const isMaximized = window.isMaximized();
    if (isMaximized) window.unmaximize(); else window.maximize();
    return { type: 'maximize', state: isMaximized ? 'unmaximized' : 'maximized' };
  }

  handlePin(event) {
    const activeWindow = BrowserWindow.fromWebContents(event.sender);
    const newPinState = !activeWindow.isAlwaysOnTop();

    if (newPinState) activeWindow.setAlwaysOnTop(true, 'pop-up-menu', 1);
    else activeWindow.setAlwaysOnTop(false);

    activeWindow.webContents.send('window-state-changed', {
      type: 'pin',
      pinned: newPinState,
      iconPath: newPinState ? this.pinIconPath.pinned : this.pinIconPath.unpinned,
    });

    return {
      isPinned: newPinState,
      iconPath: newPinState ? this.pinIconPath.pinned : this.pinIconPath.unpinned,
    };
  }

  handleGetState(event) {
    const window = BrowserWindow.fromWebContents(event.sender);
    return {
      isPinned: window.isAlwaysOnTop(),
      iconPath: window.isAlwaysOnTop() ? this.pinIconPath.pinned : this.pinIconPath.unpinned,
    };
  }
}

const windowManager = new WindowControlsManager();

module.exports = {
  handleWindowControls: (event, command) => windowManager.handleControl(event, command),
  handleWindowPin: event => windowManager.handlePin(event),
  handleGetState: event => windowManager.getState(event),
};

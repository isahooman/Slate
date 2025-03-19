const { contextBridge, ipcRenderer } = require('electron');

// todo: split the api into separate objects
contextBridge.exposeInMainWorld('api', {
  // env
  isDev: process.env.NODE_ENV === 'development',

  // settings
  openSettings: () => ipcRenderer.send('open-settings'),
  loadSettings: () => ipcRenderer.send('load-settings'),
  onSettingsLoaded: callback => {
    ipcRenderer.removeAllListeners('settings-loaded');
    ipcRenderer.on('settings-loaded', (_, settings) => callback(settings));
  },
  updateTheme: theme => ipcRenderer.send('update-theme', theme),
  onThemeUpdated: callback => {
    ipcRenderer.removeAllListeners('theme-updated');
    ipcRenderer.on('theme-updated', callback);
  },
  updateLayout: layout => {
    ipcRenderer.send('update-layout', layout);
    ipcRenderer.send('layout-change', layout);
  },
  onLayoutUpdated: callback => {
    ipcRenderer.removeAllListeners('layout-updated');
    ipcRenderer.on('layout-updated', (_, success) => callback(success));
  },

  getInitialState: () => ipcRenderer.invoke('window:get-initial-state'),
  sendToMain: (channel, data) => ipcRenderer.send(channel, data),
  onLayoutChanged: callback => {
    ipcRenderer.removeAllListeners('layout-changed');
    ipcRenderer.on('layout-changed', (_, layout) => callback(layout));
  },

  // try to separate

  // Alert API
  alert: {
    show: message => ipcRenderer.send('alert:show', message),
    close: () => ipcRenderer.send('alert:close'),
    onMessage: callback => {
      ipcRenderer.removeAllListeners('alert:message');
      ipcRenderer.on('alert:message', (_, message) => callback(message));
    },
  },

  // Output Box API
  output: {
    clear: elementId =>
      ipcRenderer.send('output-clear', elementId),
    onStateChange: (elementId, callback) => {
      ipcRenderer.removeAllListeners(`output-state-change-${elementId}`);
      ipcRenderer.on(`output-state-change-${elementId}`, (_, state) => callback(state));
    },
    updateState: (elementId, state) =>
      ipcRenderer.send('output-update-state', { elementId, state }),
  },

  // Window Controls API
  window: {
    minimize: () => ipcRenderer.send('window:control', 'minimize'),
    maximize: () => ipcRenderer.send('window:control', 'maximize'),
    close: () => ipcRenderer.send('window:control', 'close'),
    pin: () => ipcRenderer.invoke('window:pin'),
    onStateChange: callback => {
      ipcRenderer.removeAllListeners('window-state-changed');
      ipcRenderer.on('window-state-changed', callback);
    },
  },
});

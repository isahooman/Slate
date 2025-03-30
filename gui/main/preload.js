const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // General
  isDev: process.env.NODE_ENV === 'development',
  sendToMain: (channel, data) => ipcRenderer.send(channel, data),

  // Settings API
  settings: {
    open: () => ipcRenderer.send('open-settings'),
    load: () => ipcRenderer.send('load-settings'),
    onLoaded: callback => {
      ipcRenderer.removeAllListeners('settings-loaded');
      ipcRenderer.on('settings-loaded', (_, settings) => callback(settings));
    },
  },

  // Theme API
  theme: {
    update: theme => ipcRenderer.send('update-theme', theme),
    onUpdated: callback => {
      ipcRenderer.removeAllListeners('theme-updated');
      ipcRenderer.on('theme-updated', (_, theme) => callback(theme));
    },
  },

  // Layout API
  layout: {
    update: layout => {
      ipcRenderer.send('update-layout', layout);
      ipcRenderer.send('layout-change', layout);
    },
    onUpdated: callback => {
      ipcRenderer.removeAllListeners('layout-updated');
      ipcRenderer.on('layout-updated', (_, success) => callback(success));
    },
    onChange: callback => {
      ipcRenderer.removeAllListeners('layout-changed');
      ipcRenderer.on('layout-changed', (_, layout) => callback(layout));
    },
  },

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
    getInitialState: () => ipcRenderer.invoke('window:get-initial-state'),
  },
});

const { contextBridge, ipcRenderer } = require('electron');

const channelListeners = new Map();

const createSafeListener = (channel, callback) => {
  // Check if the channel exists
  if (!channelListeners.has(channel)) channelListeners.set(channel, new Map());

  // Check if the callback is already registered
  const listeners = channelListeners.get(channel);
  if (listeners.has(callback)) return listeners.get(callback).cleanup;

  // Create handler and cleanup function
  const handler = (_, ...args) => callback(...args);
  const cleanup = () => {
    ipcRenderer.removeListener(channel, handler);
    listeners.delete(callback);
    if (listeners.size === 0) channelListeners.delete(channel);
  };

  // Register the new listener
  ipcRenderer.on(channel, handler);
  listeners.set(callback, { handler, cleanup });

  return cleanup;
};

contextBridge.exposeInMainWorld('api', {
  // General
  isDev: process.env.NODE_ENV === 'development',
  sendToMain: (channel, data) => ipcRenderer.send(channel, data),

  // Settings API
  settings: {
    open: () => ipcRenderer.send('open-settings'),
    load: () => ipcRenderer.send('load-settings'),
    onLoaded: callback => createSafeListener('settings-loaded', callback),
  },

  // Theme API
  theme: {
    update: theme => ipcRenderer.send('update-theme', theme),
    onUpdated: callback => createSafeListener('theme-updated', callback),
  },

  // Layout API
  layout: {
    update: layout => ipcRenderer.send('layout:update', layout),
    onUpdated: callback => createSafeListener('layout-updated', callback),
  },

  // Alert API
  alert: {
    show: message => ipcRenderer.send('alert:show', message),
    close: () => ipcRenderer.send('alert:close'),
    onMessage: callback => createSafeListener('alert:message', callback),
  },

  // Window Controls API
  window: {
    minimize: () => ipcRenderer.send('window:control', 'minimize'),
    maximize: () => ipcRenderer.send('window:control', 'maximize'),
    close: () => ipcRenderer.send('window:control', 'close'),
    pin: () => ipcRenderer.invoke('window:pin'),
    onStateChange: callback => createSafeListener('window-state-changed', callback),
    getInitialState: () => ipcRenderer.invoke('window:get-initial-state'),
  },

  // Terminal API
  terminal: {
    log: message => ipcRenderer.send('terminal:log', message),
    start: () => ipcRenderer.send('terminal:start'),
    clear: () => ipcRenderer.send('terminal:clear'),
    getBuffer: () => ipcRenderer.invoke('terminal:get-buffer'),

    onLog: callback => createSafeListener('terminal-log', callback),
    onData: callback => createSafeListener('terminal-data', callback),
    onClear: callback => createSafeListener('terminal-clear', callback),
  },

  // Debug API
  debug: {
    openDevTools: () => ipcRenderer.send('debug:open-devtools'),
  },
});

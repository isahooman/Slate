const { app, ipcMain } = require('electron');
const { handleWindowControls, handleWindowPin, handleGetState } = require('./ipc/handlers/window');
const { handleUpdateTheme, handleLoadSettings } = require('./ipc/handlers/settings');
const { handleLayoutUpdate } = require('./ipc/handlers/layout');
const windowManager = new (require('./windows/windowManager'))();
const { handleSyncOutput, handleOutputClear } = require('./ipc/handlers/outputBox');
const { handleAlertShow, handleAlertClose } = require('./ipc/handlers/alert');

function registerIpcHandlers() {
  // Window controls
  ipcMain.on('window:control', handleWindowControls);
  ipcMain.handle('window:pin', handleWindowPin);
  ipcMain.handle('window:get-initial-state', handleGetState);

  // Alert handlers
  ipcMain.on('alert:show', (event, message) => handleAlertShow(event, message));
  ipcMain.on('alert:close', event => handleAlertClose(event));

  // Settings handlers
  ipcMain.on('open-settings', event => {
    windowManager.createWindow('settings', event.sender);
  });

  // Theme handlers
  ipcMain.on('update-theme', handleUpdateTheme);

  // Layout handlers
  ipcMain.on('layout:update', handleLayoutUpdate);

  // Settings handlers
  ipcMain.on('load-settings', handleLoadSettings);

  // Output handlers
  ipcMain.on('output-update-state', handleSyncOutput);
  ipcMain.on('output-clear', handleOutputClear);
}

// Create main window
app.on('ready', () => {
  windowManager.createWindow('main');
  registerIpcHandlers();
});

// Cleanup on close
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    windowManager.closeAllWindows();
    app.quit();
  }
});

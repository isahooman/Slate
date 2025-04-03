const { BrowserWindow } = require('electron');
const { loadSettings, saveSettings } = require('./settings');

class LayoutManager {
  handleLayoutUpdate(event, layout) {
    const settings = loadSettings();
    settings.layout = layout;
    const success = saveSettings(settings);

    // Notify all windows about the layout change
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('layout-updated', layout);
    });

    return success;
  }
}

const layoutManager = new LayoutManager();

module.exports = {
  handleLayoutUpdate: (event, layout) => layoutManager.handleLayoutUpdate(event, layout),
};

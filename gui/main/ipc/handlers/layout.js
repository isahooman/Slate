const { BrowserWindow } = require('electron');
const { loadSettings, saveSettings } = require('./settings');

class LayoutManager {
  handleLayoutUpdate(event, layout) {
    // Validate the layout value
    const layoutValue = typeof layout === 'string' && (layout === 'compact' || layout === 'expanded') ? layout : 'expanded';

    const settings = loadSettings();
    settings.layout = layoutValue;
    const success = saveSettings(settings);

    // Notify all windows about the layout change
    BrowserWindow.getAllWindows().forEach(win => {
      if (win && !win.isDestroyed() && win.webContents) win.webContents.send('layout-updated', layoutValue);
    });

    return success;
  }
}

const layoutManager = new LayoutManager();

module.exports = {
  handleLayoutUpdate: (event, layout) => layoutManager.handleLayoutUpdate(event, layout),
};

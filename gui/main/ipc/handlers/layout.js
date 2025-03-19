const { BrowserWindow } = require('electron');

class LayoutManager {
  handleLayoutChange(event, layout) {
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (!mainWindow) return;
    mainWindow.webContents.send('layout-changed', layout);
  }
}

const layoutManager = new LayoutManager();

module.exports = {
  handleLayoutChange: (event, layout) => layoutManager.handleLayoutChange(event, layout),
};

const { BrowserWindow } = require('electron');

class OutputManager {
  handleSyncOutput(event, data) {
    const { elementId, state } = data;
    this.broadcast(`output-state-change-${elementId}`, state);
  }

  handleOutputClear(event, elementId) {
    this.broadcast(`output-state-change-${elementId}`, {
      display: false,
      clear: true,
    });
  }

  broadcast(channel, data) {
    BrowserWindow.getAllWindows().forEach(window => {
      if (!window.isDestroyed()) window.webContents.send(channel, data);
    });
  }
}

const outputManager = new OutputManager();

module.exports = {
  handleSyncOutput: (event, data) => outputManager.handleSyncOutput(event, data),
  handleOutputClear: (event, elementId) => outputManager.handleOutputClear(event, elementId),
};

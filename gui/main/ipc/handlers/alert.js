const { BrowserWindow } = require('electron');
const { createAlertWindow } = require('../../windows/createAlert');

class AlertManager {
  constructor() {
    this.activeAlerts = new Map();
  }

  // Create new alert
  handleShow(event, message) {
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    const alertWindow = createAlertWindow(parentWindow, message);
    this.activeAlerts.set(alertWindow.id, alertWindow);

    alertWindow.webContents.once('did-finish-load', () => {
      alertWindow.webContents.send('alert:message', message);
    });
  }

  // Cleanup alert when close
  handleClose(event) {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
      this.activeAlerts.delete(window.id);
    }
  }
}

const alertManager = new AlertManager();

module.exports = {
  handleAlertShow: (event, message) => alertManager.handleShow(event, message),
  handleAlertClose: event => alertManager.handleClose(event),
};

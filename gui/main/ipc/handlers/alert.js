const { BrowserWindow } = require('electron');
const { createAlertWindow } = require('../../windows/createAlert');

class AlertManager {
  constructor() {
    this.activeAlerts = new Map();
  }

  /**
   * Creates and displays a new alert window with the specified message
   * @param {Electron.IpcMainEvent} event - The IPC event from the sender
   * @param {string} message - The message to display in the alert
   * @author isahooman
   */
  handleShow(event, message) {
    const parentWindow = BrowserWindow.fromWebContents(event.sender);
    const alertWindow = createAlertWindow(parentWindow, message);

    // Track this alert window in the collection
    this.activeAlerts.set(alertWindow.id, alertWindow);

    // When ready, display the alert window
    alertWindow.webContents.once('did-finish-load', () => {
      alertWindow.webContents.send('alert:message', message);
    });
  }

  /**
   * Close and clean up the alert window
   * @param {Electron.IpcMainEvent} event - The IPC event from the sender
   * @author isahooman
   */
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

const { BrowserWindow } = require('electron');

class TerminalHandler {
  constructor() {
    this.buffer = [];
    this.maxBuffer = 5000;
  }

  /**
   * Logs a message and broadcasts it to all terminals
   * @param {any} message - The message to log
   * @author isahooman
   */
  logMessage(message) {
    const stringMessage = String(message);
    this.addToBuffer(stringMessage);
    this.broadcast('terminal-log', stringMessage);
  }

  /**
   * Add a message to the terminal buffer
   * @param {string} message - The message to add to the buffer
   * @author isahooman
   * @private
   */
  addToBuffer(message) {
    this.buffer.push(message);
    if (this.buffer.length > this.maxBuffer) this.buffer = this.buffer.slice(this.buffer.length - this.maxBuffer);
  }

  /**
   * Clears the terminal buffer and broadcasts the empty buffer
   * @author isahooman
   */
  clearBuffer() {
    this.buffer = [];
    this.broadcast('terminal-clear');
  }

  /**
   * Broadcasts terminal data
   * @param {any} data - The terminal data to broadcast
   * @author isahooman
   */
  emitData(data) {
    this.broadcast('terminal-data', data);
  }

  /**
   * Returns a the terminal buffer
   * @returns {string[]} Array containing all logs
   * @author isahooman
   */
  getBuffer() {
    return [...this.buffer];
  }

  /**
   * Sends a message to all renderer processes
   * @param {string} channel - The IPC channel
   * @param {any} message - The message to send
   * @author isahooman
   * @private
   */
  broadcast(channel, message) {
    BrowserWindow.getAllWindows().forEach(win => {
      if (!win.isDestroyed()) win.webContents.send(channel, message);
    });
  }
}

module.exports = new TerminalHandler();

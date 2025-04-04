const fs = require('fs');
const path = require('path');
const { app, BrowserWindow } = require('electron');

/**
 * Manages gui settings saving and loading
 * @class SettingsManager
 */
class SettingsManager {
  constructor() {
    this.settingsPath = path.join(app.getPath('userData'), 'Data', 'settings.json');
    this.defaultSettings = {
      theme: 'dark',
      layout: 'expanded',
    };
  }

  /**
   * Ensures the settings directory exists
   * @author isahooman
   * @private
   */
  ensureDataDirectory() {
    const dir = path.dirname(this.settingsPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  /**
   * Saves settings
   * @param {object} settings - The setting to save
   * @returns {boolean} Whether or not the save was successful
   * @author isahooman
   */
  saveSettings(settings) {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error.message);
      return false;
    }
  }

  /**
   * Loads settings from appdata, returns default settings if not found
   * @returns {object} The loaded settings
   * @author isahooman
   */
  loadSettings() {
    try {
      this.ensureDataDirectory();
      let settings = this.defaultSettings;

      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf-8');
        const savedSettings = JSON.parse(data);

        // Ensure all default settings exist
        settings = Object.keys(this.defaultSettings).reduce((acc, key) => {
          acc[key] = savedSettings[key] !== undefined ? savedSettings[key] : this.defaultSettings[key];
          return acc;
        }, {});

        // Save if any defaults were added
        if (Object.keys(settings).length !== Object.keys(savedSettings).length) this.saveSettings(settings);
      } else {
        this.saveSettings(settings);
      }

      return settings;
    } catch (error) {
      console.error('Error loading settings:', error.message);
      return this.defaultSettings;
    }
  }

  /**
   * Updates the theme and notifies all windows
   * @param {Electron.IpcMainEvent} event - the IPC event
   * @param {string} theme - The new theme
   * @returns {boolean} Whether or not the update was successful
   * @author isahooman
   */
  handleUpdateTheme(event, theme) {
    const settings = this.loadSettings();
    settings.theme = theme;
    const success = this.saveSettings(settings);

    // Notify all windows about the theme change
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('theme-updated', theme);
    });

    return success;
  }

  /**
   * Updates the layout and notifies all windows
   * @param {Electron.IpcMainEvent} event - The IPC event
   * @param {string} layout - The new layout
   * @returns {boolean} Whether or not the update was successful
   * @author isahooman
   */
  handleUpdateLayout(event, layout) {
    const settings = this.loadSettings();
    settings.layout = layout;
    const success = this.saveSettings(settings);

    // Notify all windows about the layout change
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('layout-updated', layout);
    });

    return success;
  }

  /**
   * Loads settings and sends back to the renderer process
   * @param {Electron.IpcMainEvent} event - The IPC event
   */
  handleLoadSettings(event) {
    const settings = this.loadSettings();
    event.reply('settings-loaded', settings);
  }
}

const settingsManager = new SettingsManager();

module.exports = {
  handleUpdateTheme: (event, theme) => settingsManager.handleUpdateTheme(event, theme),
  handleLoadSettings: (event) => settingsManager.handleLoadSettings(event),
  handleUpdateLayout: (event, layout) => settingsManager.handleUpdateLayout(event, layout),
  loadSettings: () => settingsManager.loadSettings(),
  saveSettings: (settings) => settingsManager.saveSettings(settings),
};

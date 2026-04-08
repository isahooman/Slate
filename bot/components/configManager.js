const path = require('path');
const fs = require('fs');
const { readJSON5, writeJSON5 } = require('./json5Parser');

class ConfigManager {
  constructor(configBasePath = './config') {
    this.configBasePath = configBasePath;
    this.listeners = new Map();
  }

  /**
   * Gets the full path to a config file
   * @param {string} configType - The config identifier
   * @returns {string} Full path to the config file
   * @author isahooman
   */
  getConfigPath(configType) {
    const [directory = 'bot', configName = configType] = configType.includes(':') ?
      configType.split(':') :
      ['bot', configType];

    return path.join(this.configBasePath, directory, `${configName}.json5`);
  }

  /**
   * Loads and parses a configuration file
   * @param {string} configType - The config identifier
   * @returns {object} Parsed config object
   * @author isahooman
   */
  loadConfig(configType) {
    const configPath = this.getConfigPath(configType);

    try {
      // Check if the file exists and read it
      return fs.existsSync(configPath) ? readJSON5(configPath) : {};
    } catch (error) {
      process.stderr.write(`Error loading config ${configType}: ${error}\n`);
      return {};
    }
  }

  /**
   * Saves data to a configuration file
   * @param {string} configType - The config identifier
   * @param {object} config - The object to save
   * @returns {boolean} Success status
   * @author isahooman
   */
  saveConfig(configType, config) {
    try {
      const configPath = this.getConfigPath(configType);
      const dirPath = path.dirname(configPath);

      // Create directory structure if it doesn't exist
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

      // Write new configuration to file
      writeJSON5(configPath, config);

      // Notify all listeners about the change
      this.notifyListeners(configType, config);
      return true;
    } catch (error) {
      process.stderr.write(`Error saving config ${configType}: ${error}\n`);
      return false;
    }
  }

  /**
   * Updates a specific value in a configuration file
   * @param {string} configType - The config identifier
   * @param {string} key - The property path
   * @param {any} value - New value to set
   * @returns {boolean} Success status
   * @author isahooman
   */
  updateConfigValue(configType, key, value) {
    const config = this.loadConfig(configType);
    const keys = key.split('.');
    let current = config;

    // Navigate through the object properties
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]] = current[keys[i]] || {};
    // Set the property to the new value
    current[keys[keys.length - 1]] = value;
    // Save the updated configuration
    return this.saveConfig(configType, config);
  }

  /**
   * Retrieves a specific value from a configuration file
   * @param {string} configType - The config identifier
   * @param {string} key - The property path
   * @returns {any} Retrieved value
   * @author isahooman
   */
  getConfigValue(configType, key) {
    const config = this.loadConfig(configType);
    const keys = key.split('.');
    let current = config;

    // Navigate through the object properties
    for (const k of keys) {
      if (!current || typeof current !== 'object' || !(k in current)) return;

      current = current[k];
    }

    return current;
  }

  /**
   * Adds a listener for configuration changes
   * @param {string} configType - The config identifier
   * @param {Function} callback - Callback function to execute on change
   * @returns {string} Unique listener ID
   * @author isahooman
   */
  addConfigListener(configType, callback) {
    const listenerId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    // Ensure the listener map exists
    if (!this.listeners.has(configType)) this.listeners.set(configType, new Map());

    // Register the listener
    this.listeners.get(configType).set(listenerId, callback);
    return listenerId;
  }

  /**
   * Removes a registered config listener
   * @param {string} configType - The config identifier
   * @param {string} listenerId - Listener ID from addConfigListener
   * @returns {boolean} Success status
   * @author isahooman
   */
  removeConfigListener(configType, listenerId) {
    const listeners = this.listeners.get(configType);
    // Delete the listener if it exists
    return listeners ? listeners.delete(listenerId) : false;
  }

  /**
   * Calls all registered listeners for a config type
   * @param {string} configType - The config identifier
   * @param {object} config - Updated configuration object
   * @author isahooman
   */
  notifyListeners(configType, config) {
    const listeners = this.listeners.get(configType);
    if (!listeners) return;

    // Iterate through all listeners and call them
    Array.from(listeners.values()).forEach(callback => {
      try {
        return callback(config);
      } catch (error) {
        process.stderr.write(`Error in config listener: ${error}\n`);
      }
    });
  }
}

const configManager = new ConfigManager();

module.exports = configManager;

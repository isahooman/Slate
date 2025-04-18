const path = require('path');
const fs = require('fs');
const { readJSON5, writeJSON5 } = require('./json5Parser');

class ConfigManager {
  constructor(configBasePath = './config') {
    this.configBasePath = configBasePath;
    this.listeners = new Map();
  }

  getConfigPath(configType) {
    const [directory = 'bot', configName = configType] = configType.includes(':') ?
      configType.split(':') :
      ['bot', configType];

    return path.join(this.configBasePath, directory, `${configName}.json5`);
  }

  loadConfig(configType) {
    const configPath = this.getConfigPath(configType);

    try {
      return fs.existsSync(configPath) ? readJSON5(configPath) : {};
    } catch (error) {
      process.stderr.write(`Error loading config ${configType}: ${error}\n`);
      return {};
    }
  }

  saveConfig(configType, config) {
    try {
      const configPath = this.getConfigPath(configType);
      const dirPath = path.dirname(configPath);

      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

      writeJSON5(configPath, config);
      this.notifyListeners(configType, config);
      return true;
    } catch (error) {
      process.stderr.write(`Error saving config ${configType}: ${error}\n`);
      return false;
    }
  }

  updateConfigValue(configType, key, value) {
    const config = this.loadConfig(configType);
    const keys = key.split('.');
    let current = config;

    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]] = current[keys[i]] || {};

    current[keys[keys.length - 1]] = value;
    return this.saveConfig(configType, config);
  }

  getConfigValue(configType, key, defaultValue = null) {
    const config = this.loadConfig(configType);
    const keys = key.split('.');
    let current = config;

    for (const k of keys) {
      if (!current || typeof current !== 'object' || !(k in current)) return defaultValue;

      current = current[k];
    }

    return current;
  }

  addConfigListener(configType, callback) {
    const listenerId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    if (!this.listeners.has(configType)) this.listeners.set(configType, new Map());

    this.listeners.get(configType).set(listenerId, callback);
    return listenerId;
  }

  removeConfigListener(configType, listenerId) {
    const listeners = this.listeners.get(configType);
    return listeners ? listeners.delete(listenerId) : false;
  }

  notifyListeners(configType, config) {
    const listeners = this.listeners.get(configType);
    if (!listeners) return;

    Array.from(listeners.values()).forEach(callback => {
      try {
        // eslint-disable-next-line callback-return
        callback(config);
      } catch (error) {
        process.stderr.write(`Error in config listener: ${error}\n`);
      }
    });
  }
}

const configManager = new ConfigManager();
module.exports = configManager;

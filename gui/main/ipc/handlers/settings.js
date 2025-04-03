const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { readJSON5 } = require('../../components/json5Parser.js');
const settingsJSON = readJSON5(path.join(__dirname, '../../config/settings.json5'));

const settingsPath = path.join(app.getPath('userData'), 'Data', 'settings.json5');
const defaultSettings = {
  theme: 'dark',
  layout: 'expanded',
};

const ensureDataDirectory = () => {
  const dir = path.dirname(settingsPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const saveSettings = settings => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error.message);
    return false;
  }
};

const loadSettings = () => {
  try {
    ensureDataDirectory();
    let settings = defaultSettings;

    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      const savedSettings = JSON.parse(data);

      // Ensure all default settings exist
      settings = Object.keys(defaultSettings).reduce((acc, key) => {
        acc[key] = savedSettings[key] !== undefined ? savedSettings[key] : defaultSettings[key];
        return acc;
      }, {});

      // Save if any defaults were added
      if (Object.keys(settings).length !== Object.keys(savedSettings).length) saveSettings(settings);
    } else {
      saveSettings(settings);
    }

    return settings;
  } catch (error) {
    console.error('Error loading settings:', error.message);
    return defaultSettings;
  }
};

const handleUpdateTheme = (event, theme) => {
  const settings = loadSettings();
  settings.theme = theme;
  const success = saveSettings(settings);
  event.reply('theme-updated', success);
};

const handleUpdateLayout = (event, layout) => {
  const settings = loadSettings();
  settings.layout = layout;
  const success = saveSettings(settings);

  event.reply('layout-updated', success);
};

const handleLoadSettings = event => {
  const settings = loadSettings();
  event.reply('settings-loaded', settings);
};

module.exports = {
  handleUpdateTheme,
  handleLoadSettings,
  handleUpdateLayout,
  loadSettings,
  saveSettings,
};

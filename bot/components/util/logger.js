const path = require('path');
const configManager = require('../../../components/configManager');
const fs = require('fs');
const moment = require('moment');
const report = require('./report');
const colors = require('./colors');

const logging = configManager.loadConfig('logging');
const outputDir = path.join(__dirname, '..', '..', '..', 'output');
const logFile = path.join(outputDir, 'bot.log');
const errorDir = path.join(outputDir, 'err');

const levels = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
  COMMAND: 'COMMAND',
  START: 'START',
  MESSAGE: 'MESSAGE',
  INTERACTION: 'INTERACTION',
  LOADING: 'LOADING',
};

/**
 * Checks to see if logging levels exist and are enabled.
 * @param {string} level Logging Level name (e.g., 'INFO', 'WARN')
 * @returns {boolean} True if the level is enabled, false otherwise.
 * @author isahooman
 */
function isLevelEnabled(level) {
  let configUpdated = false;

  // Initialize toggle and colors objects if they don't exist
  if (!logging.toggle) logging.toggle = {};
  if (!logging.colors) logging.colors = {};

  // Check if the toggle setting exists, default to true if not
  if (!Object.prototype.hasOwnProperty.call(logging.toggle, level)) {
    logging.toggle[level] = true;
    configUpdated = true;
    process.stdout.write(
      colors.toAnsi('#FFCC00') +
      `Log level [${level}] toggle missing from logging config, defaulting to enabled.` +
      '\x1b[0m\n',
    );
  }

  // Check if the color setting exists, default to white if not
  if (!Object.prototype.hasOwnProperty.call(logging.colors, level)) {
    logging.colors[level] = '#FFFFFF';
    configUpdated = true;
    process.stdout.write(
      colors.toAnsi('#FFCC00') +
      `Log level [${level}] color missing from logging config, defaulting to #FFFFFF.` +
      '\x1b[0m\n',
    );
  }

  // If any defaults were added, update the config file.
  if (configUpdated) try {
    configManager.saveConfig('logging', logging);
  } catch (err) {
    process.stderr.write(`Failed to update logging config with default settings for level [${level}]: ${err}\n`);
  }

  // Return the toggle status (which is now guaranteed to exist)
  return logging.toggle[level];
}

/**
 * Toggles logging levels
 * @param {string} level Level Name
 * @param {boolean} enabled True or False
 * @author isahooman
 */
function setLevelEnabled(level, enabled) {
  if (Object.prototype.hasOwnProperty.call(levels, level)) {
    logging.toggle[level] = enabled;
    try {
      configManager.updateConfigValue('logging', `toggle.${level}`, enabled);
    } catch (err) {
      process.stderr.write(`Error writing to logging config file: ${err}\n`);
    }
  }
}

/**
 * Applies color to text using the colors utility
 * @param {string} text - Text to color
 * @param {string} colorName - Name of the color from config
 * @returns {string} Colored text with ANSI codes
 * @author isahooman
 */
const colorize = (text, colorName) => {
  let hexCode = logging.colors[colorName] || '#FFFFFF';
  // Check if the hex code is valid
  if (!/^#?[0-9A-F]{6}$/i.test(hexCode)) {
    process.stdout.write(
      colors.toAnsi('#FFCC00') +
      `Invalid color code in logging config for ${colorName}: ${hexCode}. Using fallback color.` +
      '\x1b[0m\n',
    );
    hexCode = '#FFFFFF';
  }
  if (!hexCode.startsWith('#')) hexCode = `#${hexCode}`;
  return colors.toAnsi(hexCode) + text + '\x1b[0m';
};

/**
 * Formats and logs messages
 * @param {string} level Level name
 * @param {string} message Log Message
 * @param {commandType} commandType Command Type
 * @param {commandInfo} commandInfo Command Info
 * @returns {void|string} Void if disabled, String if enabled
 * @author isahooman
 */
function logMessage(level, message, commandType = 'unknown', commandInfo = {}) {
  // Ignore disabled log levels
  if (!isLevelEnabled(level)) return;
  // Ensure message is a string
  if (typeof message !== 'string') return;

  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  const logtime = colorize(`[${timestamp}]`, 'TIMESTAMP');
  const loglevel = colorize(level, level);

  // Format file log output
  const fileformat = inputMessage =>
    inputMessage.split(/(?<!\\),/).map(part => {
      part = part.replace(/\\,/g, ',');
      return part;
    }).join(',');

  // Format message for console output
  let formattedMessage = message;

  formattedMessage = formattedMessage
    .split(/(?<!\\),(?![^[]*\])/)
    .map(part => {
      // Remove preceding backslashes from the message
      part = part.replace(/\\,/g, ',');

      // Color text within brackets
      part = part.replace(/\[(.*?)\]/g, (match, p1) => {
        return `[${colorize(p1, 'BRACKET')}]`;
      });

      // Color text after colons
      if (part.includes(':')) {
        const [firstPart, ...rest] = part.split(':');
        part = `${colorize(firstPart, 'TEXT')}:${colorize(rest.join(':'), 'COLON')}`;
      }
      return part;
    })
    .join(',');

  // Console output
  process.stdout.write(`${logtime} <${loglevel}> ${formattedMessage}\n`);

  // Log file output
  fs.appendFileSync(logFile, `<${timestamp}> <${level}> ${fileformat(message)}\n`);

  // Handle notifications
  const notifyOnReady = configManager.getConfigValue('config', 'notifyOnReady', false);
  const reportErrors = configManager.getConfigValue('config', 'reportErrors', false);

  if (level === levels.START && notifyOnReady) report.sendReadyNotification(message);
  if (level === levels.ERROR && reportErrors) report.sendErrorReport(message, commandType, commandInfo);
}

/**
 * Ensures required directories exist
 * @author isahooman
 */
const ensureDirectories = () => {
  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    logMessage(levels.INFO, `Created output directory: [${outputDir}]`);
  }

  // Ensure the error directory exists
  if (!fs.existsSync(errorDir)) {
    fs.mkdirSync(errorDir, { recursive: true });
    logMessage(levels.INFO, `Created error directory: [${errorDir}]`);
  }
};

ensureDirectories();

module.exports = {
  info: (message, commandType, commandInfo) => logMessage(levels.INFO, message, commandType, commandInfo),
  warn: (message, commandType, commandInfo) => logMessage(levels.WARN, message, commandType, commandInfo),
  error: (message, commandType, commandInfo) => logMessage(levels.ERROR, message, commandType, commandInfo),
  debug: (message, commandType, commandInfo) => logMessage(levels.DEBUG, message, commandType, commandInfo),
  command: message => logMessage(levels.COMMAND, message),
  start: message => logMessage(levels.START, message),
  message: message => logMessage(levels.MESSAGE, message),
  interaction: message => logMessage(levels.INTERACTION, message),
  loading: message => logMessage(levels.LOADING, message),
  setLevelEnabled,
  isLevelEnabled,
  levels,
};

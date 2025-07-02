const path = require('path');
const fs = require('fs');
const moment = require('moment');
const { sendErrorReport, sendReadyNotification } = require('./report.js');
const configManager = require('../../../components/configManager');
const { toAnsi, resetAnsi } = require('./colors.js');

// Output directories
const outputDir = path.join(__dirname, '../../../output');
const errorDir = path.join(outputDir, 'err');
const logFile = path.join(outputDir, 'bot.log');

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
 * Logs a message to the console with a timestamp and log level.
 * @param {string} message - The message to log.
 */
function consoleOut(message) {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  process.stdout.write(`[${timestamp}] ${message}\n`);
}

/**
 * Ensures required directories and files exist
 * @author isahooman
 */
function ensureDirectories() {
  try {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      consoleOut(`Created output directory: [${outputDir}]`);
    }

    // Ensure the error directory exists
    if (!fs.existsSync(errorDir)) {
      fs.mkdirSync(errorDir, { recursive: true });
      consoleOut(`Created error directory: [${errorDir}]`);
    }

    // Ensure log file exists
    if (!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, '', { flag: 'w' });
      consoleOut(`Created log file: [${logFile}]`);
    }
  } catch (err) {
    consoleOut(`Failed to create directories or log file: ${err.message}`);
  }
}

// Initialize directories and files before any logging
ensureDirectories();

/**
 * Checks to see if logging levels are enabled
 * @param {number} level Logging Level
 * @returns {boolean} Active or not
 * @author isahooman
 */
function isLevelEnabled(level) {
  const loggingConfig = configManager.loadConfig('logging');

  if (!Object.prototype.hasOwnProperty.call(loggingConfig.toggle, level)) {
    // If the level doesn't exist within the config, enable it by default
    loggingConfig.toggle[level] = true;
    configManager.saveConfig('logging', loggingConfig);
  }
  return configManager.getConfigValue('logging', `toggle.${level}`);
}

/**
 * Apply color formatting to a log message
 * @param {string} message - The message to format
 * @param {string} level - Log level
 * @returns {string} Formatted message
 * @author isahooman
 */
function consoleFormat(message, level) {
  const colors = configManager.loadConfig('logging').colors;

  // Get color codes
  const textColor = toAnsi(colors.TEXT);
  const timestampColor = toAnsi(colors.TIMESTAMP);
  const levelColor = toAnsi(colors[level] || colors.TEXT);
  const bracketColor = toAnsi(colors.BRACKET);
  const colonColor = toAnsi(colors.COLON);

  let formattedMessage = '';
  let inBrackets = false;
  let inColon = false;
  let position = 0;

  // Format timestamp section: [YYYY-MM-DD HH:mm:ss]
  const timestampMatch = message.match(/^\[(.*?)\]/);
  if (timestampMatch) {
    formattedMessage += `${textColor}[${timestampColor}${timestampMatch[1]}${textColor}]`;
    position = timestampMatch[0].length;
  }

  // Format log level section: <LEVEL>
  const levelMatch = message.substring(position).match(/^\s*<(.*?)>/);
  if (levelMatch) {
    formattedMessage += `${textColor} <${levelColor}${levelMatch[1]}${textColor}>`;
    position += levelMatch[0].length;
  }

  // Process the log message
  for (; position < message.length; position++) {
    const char = message[position];
    const nextChar = message[position + 1] || '';

    // Handle escaped commas
    if (char === '\\' && nextChar === ',') {
      formattedMessage += (inColon ? colonColor : textColor) + '\\,';
      position++;
      continue;
    }

    // Handle bracket formatting
    if (char === '[') {
      formattedMessage += (inColon ? colonColor : textColor) + '[';
      inBrackets = true;
      continue;
    }

    if (char === ']' && inBrackets) {
      formattedMessage += (inColon ? colonColor : textColor) + ']';
      inBrackets = false;
      continue;
    }

    // Handle colon formatting
    if (char === ':' && !inBrackets) {
      formattedMessage += textColor + ':';
      inColon = true;
      continue;
    }

    // Break colon formatting on comma
    if (char === ',' && inColon) {
      formattedMessage += textColor + ',';
      inColon = false;
      continue;
    }

    // Colorize the character based on context
    formattedMessage +=
      inBrackets ? bracketColor + char :
        inColon ? colonColor + char :
          textColor + char;
  }

  return formattedMessage + resetAnsi();
}

/**
 * Toggles logging levels
 * @param {string} level Level Name
 * @param {boolean} enabled True or False
 * @author isahooman
 */
function setLevelEnabled(level, enabled) {
  if (Object.prototype.hasOwnProperty.call(levels, level)) configManager.updateConfigValue('logging', `toggle.${level}`, enabled);
}

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
  const logText = `[${timestamp}] <${level}> ${message}`;

  // Format console output with colors
  const formattedMessage = consoleFormat(logText, level);
  process.stdout.write(formattedMessage + '\n');

  try {
    // Log file output (without colors)
    fs.appendFileSync(logFile, `<${timestamp}> <${level}> ${message}\n`);
  } catch {
    try {
      ensureDirectories();
      fs.appendFileSync(logFile, `<${timestamp}> <${level}> ${message}\n`);
    } catch (retryErr) {
      process.stderr.write(`Failed to write to log file: ${retryErr.message}`);
    }
  }

  const botConfig = configManager.loadConfig('config');
  if (level === levels.START && botConfig.notifyOnReady) sendReadyNotification(message, module.exports);
  if (level === levels.ERROR && botConfig.reportErrors) sendErrorReport(message, commandType, commandInfo, module.exports);
}

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

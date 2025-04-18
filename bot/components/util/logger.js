const path = require('path');
const bot = require('../../bot.js');
const chalk = require('chalk');
const configManager = require('../../../components/configManager');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const moment = require('moment');

const logging = configManager.loadConfig('logging');
const logFile = path.join(__dirname, '..', '..', 'bot.log');
const tempDir = path.join(__dirname, '..', '..', 'temp');
const errorDir = path.join(tempDir, 'error');
let errorFileCounter = 0;
const Queue = [];

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
    process.stdout.write(chalk.yellow(`Log level [${level}] toggle missing from logging config, defaulting to enabled.\n`));
  }

  // Check if the color setting exists, default to white if not
  if (!Object.prototype.hasOwnProperty.call(logging.colors, level)) {
    logging.colors[level] = '#FFFFFF';
    configUpdated = true;
    process.stdout.write(chalk.yellow(`Log level [${level}] color missing from logging config, defaulting to #FFFFFF.\n`));
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

  // Get colors from logging config, default to white if invalid
  const color = colorName => {
    let hexCode = logging.colors[colorName] || '#FFFFFF';
    // Check if the hex code is valid
    if (!/^#?[0-9A-F]{6}$/i.test(hexCode)) {
      process.stdout.write(chalk.yellow(`Invalid color code in logging config for ${colorName}: ${hexCode}. Using fallback color.\n`));
      hexCode = '#FFFFFF';
    }
    if (!hexCode.startsWith('#')) hexCode = `#${hexCode}`;
    return chalk.hex(hexCode);
  };

  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  const logtime = color('TIMESTAMP')(`[${timestamp}]`);
  const logLevelColor = color(level);

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
      part = part.replace(/\[(.*?)\]/g, (match, p1) => `[${color('BRACKET')(p1)}]`);
      // Color text after colons
      if (part.includes(':')) {
        const [firstPart, ...rest] = part.split(':');
        part = `${color('TEXT')(firstPart)}:${color('COLON')(rest.join(':'))}`;
      }
      return part;
    })
    .join(',');

  // Console output
  process.stdout.write(`${logtime} <${logLevelColor(level)}> ${formattedMessage}\n`);

  // Log file output
  fs.appendFileSync(logFile, `<${timestamp}> <${level}> ${fileformat(message)}\n`);

  // Handle notifications
  const notifyOnReady = configManager.getConfigValue('config', 'notifyOnReady', false);
  const reportErrors = configManager.getConfigValue('config', 'reportErrors', false);

  if (level === levels.START && notifyOnReady) notifyReady(message);
  if (level === levels.ERROR && reportErrors) handleErrors(message, commandType, commandInfo);
}

/**
 * Error Handler
 * @param {string} messageText Message Text
 * @param {commandType} commandType Command Type
 * @param {commandInfo} commandInfo Command Info
 * @author isahooman
 */
async function handleErrors(messageText, commandType = 'unknown', commandInfo = {}) {
  if (messageText.startsWith('Shutdown because:')) {
    process.stdout.write(`Shutdown detected, skipping error report\n`);
    return;
  }

  let errorEmbed = new EmbedBuilder().setColor('#FF0000');
  let errorTitle = 'Error';
  let errorStack = '';
  let errorMessage = '';
  let errorFile = null;

  try {
    // Prepare error report for slash commands
    if (commandType === 'slash' && commandInfo.interaction) {
      const interaction = commandInfo.interaction;
      errorTitle = `Error in slash command: ${interaction.commandName}`;
      errorEmbed.setTitle(errorTitle);
      errorMessage = messageText;

      const args = interaction.options.data.map(opt => `\`${opt.name}\`: ${opt.value}`).join('\n') || 'None';
      errorEmbed.addFields(
        { name: 'User', value: interaction.user ? `${interaction.user.username} <@${interaction.user.id}>` : 'N/A' },
        { name: 'Channel', value: interaction.channelId ? `<#${interaction.channelId}> (ID: ${interaction.channelId})` : 'N/A' },
        { name: 'Server', value: interaction.guild ? `${interaction.guild.name} | ${interaction.guild.id}` : 'N/A' },
        { name: 'Arguments', value: args },
        { name: 'Error', value: messageText },
      );
    // Prepare error report for prefix commands
    } else if (commandType === 'prefix' && commandInfo.context) {
      const context = commandInfo.context;
      const commandName = commandInfo.args[0];
      errorTitle = `Error in prefix command: ${commandName}`;
      errorMessage = messageText;
      errorEmbed.addFields(
        { name: 'Server', value: context.guild ? `${context.guild.name} | ${context.guild.id}` : 'N/A' },
        { name: 'User', value: `<@${context.author.id}> | ${context.author.username}` },
        { name: 'Channel', value: `<#${context.channel.id}> | ID: ${context.channel.id}` },
        { name: 'Arguments', value: commandInfo.args.join(' ') || 'None' },
        { name: 'Error', value: messageText },
      );
    } else {
      errorEmbed.addFields(
        { name: 'Message', value: messageText },
      );
    }
    errorEmbed.setTitle(errorTitle);

    // Get stack trace from passed commandInfo
    if (commandInfo.error) errorStack = commandInfo.error.stack;
    else if (commandInfo.stack) errorStack = commandInfo.stack;
    else if (commandType === 'slash' && commandInfo.interaction) errorStack = commandInfo.interaction.stack;
    else if (commandType === 'prefix' && commandInfo.context) errorStack = commandInfo.context.stack;

    // Write an temporary file for command error stack
    if (commandType === 'slash' || commandType === 'prefix') {
      errorFileCounter++;
      errorFile = path.join(errorDir, `error-${errorFileCounter}.js`);
      const content = `Error: ${errorMessage}\n\nStack Trace:\n${errorStack}`;
      await fs.promises.writeFile(errorFile, content, 'utf-8');
    }

    await sendMessage(errorEmbed, 'error', errorFile);
  } catch (error) {
    process.stderr.write(`Error sending error report:\n${error}\n`);
  } finally {
    // Delete the temporary file after a delay
    if (errorFile) setTimeout(() => {
      try {
        fs.unlinkSync(errorFile);
      } catch (err) {
        process.stderr.write(`Error deleting temporary error file: ${err}\n`);
      }
    }, 5000);
  }
}

/**
 * Notifies that the bot is ready.
 * @param {string} message - Log message to use in the description.
 * @author isahooman
 */
function notifyReady(message) {
  // Create an embed to notify that the bot has started
  const startEmbed = new EmbedBuilder()
    .setColor('#17d5ad')
    .setTitle('Bot Ready!')
    .setDescription(message);

  // Send the ready embed
  sendMessage(startEmbed, 'ready');
}

/**
 * Sends a message to specified targets.
 * @param {object} messageContent - The message content.
 * @param {string} [targetType] - Message target type:
 *  - 'error': Sends to owner(s) and error users
 *  - 'ready': Sends to owner(s) and ready users
 *  - Otherwise, sends only to owner(s).
 * @param {string} [filePath] - The path to the file to send (optional).
 * @author isahooman
 */
async function sendMessage(messageContent, targetType = null, filePath = null) {
  // Check if the client exists before attempting to send the message
  if (!bot.client || !bot.client.isReady()) {
    process.stderr.write('Client is not ready yet. Queueing message.\n');
    Queue.push({ messageContent, targetType, filePath });
    setTimeout(processQueue, 3000);
    return;
  }

  /**
   * Process the queue, attempt to send any queued messages if the client is ready.
   * @author isahooman
   */
  function processQueue() {
    Queue.forEach(({ messageContent: queuedMessage, targetType: queuedTargetType, filePath: queuedFilePath }, index) => {
      if (bot.client.isReady()) {
        sendMessage(queuedMessage, queuedTargetType, queuedFilePath);
        Queue.splice(index, 1);
      }
    });
  }

  const { userId = null, channelId = null } = {};

  // Get owner IDs and other user lists from config
  const ownerId = configManager.getConfigValue('config', 'ownerId', []);
  const errorUsers = configManager.getConfigValue('config', 'errorUsers', []);
  const readyUsers = configManager.getConfigValue('config', 'readyUsers', []);
  const errorChannels = configManager.getConfigValue('config', 'errorChannels', []);
  const readyChannels = configManager.getConfigValue('config', 'readyChannels', []);

  // Determine recipient list based on targetType
  let recipients = [...ownerId];
  if (targetType === 'error' && errorUsers) recipients.push(...errorUsers);
  if (targetType === 'ready' && readyUsers) recipients.push(...readyUsers);

  // Add target user if provided and not already included (prevent duplicated if id is stated multiple times)
  if (userId && !recipients.includes(userId)) recipients.push(userId);

  try {
    // Send message to specific users
    for (const recipientId of recipients) await sendToUser(messageContent, recipientId, filePath);

    // Send message to given channels
    if (channelId) await sendToChannel(messageContent, [channelId], filePath);
    else if (targetType === 'error') await sendToChannel(messageContent, errorChannels, filePath);
    else if (targetType === 'ready') await sendToChannel(messageContent, readyChannels, filePath);
  } catch (error) {
    // If sending fails, add the message to the queue for retrying
    process.stderr.write('Failed to send message, adding to queue:', `${error}\n`);
    Queue.push({ messageContent, targetType, filePath });
  }
}

/**
 * Sends a message (embed or file) to target users specified by Id.
 * @param {object} messageContent - The message content (embed or file path).
 * @param {string} userId - Target user Ids
 * @param {string} [filePath] - The path to the file to send (optional).
 * @author isahooman
 */
async function sendToUser(messageContent, userId, filePath = null) {
  try {
    const user = await bot.client.users.fetch(userId);
    // If the user is not found do nothing.
    if (!user) {
      process.stderr.write('Failed to find user for sending message\n');
      return;
    }

    // Store embeds and files in message options
    const messageOptions = { embeds: [], files: [] };
    // If an embed is included add it to the message options
    if (typeof messageContent === 'object' && messageContent instanceof EmbedBuilder) messageOptions.embeds.push(messageContent);
    // If a file path is provided, add it to the message
    if (filePath) messageOptions.files.push(filePath);

    // Send the message to the user
    await user.send(messageOptions);
    process.stdout.write(`Message sent to user: ${user.username}\n`);
  } catch (err) {
    process.stderr.write(`Failed to send message to user (ID: ${userId}): ${err}\n`);
  }
}

/**
 * Sends a message to target channels within the home guild specified by Id.
 * @param {object} messageContent - The message content
 * @param {string[]} channelIds - Array of target channel Ids
 * @param {string} [filePath] - The path to the file to send (optional).
 * @author isahooman
 */
async function sendToChannel(messageContent, channelIds, filePath = null) {
  const guildId = configManager.getConfigValue('config', 'guildId', null);
  const guild = bot.client.guilds.cache.get(guildId);

  // If the guild is not found, do nothing
  if (!guild) {
    process.stderr.write('Failed to find home server to send message\n');
    return;
  }

  // Iterate through each channel ID
  for (const channelId of channelIds || []) try {
    const channel = guild.channels.cache.get(channelId);
    // If the channel is not found, continue to the next channel
    if (!channel) {
      process.stderr.write(`Failed to find channel (ID: ${channelId}) for sending message\n`);
      continue;
    }

    // Store embeds and files in message options
    const messageOptions = { embeds: [], files: [] };
    // If an embed is included add it to the message options
    if (typeof messageContent === 'object' && messageContent instanceof EmbedBuilder) messageOptions.embeds.push(messageContent);
    // If a file path is provided, add it to the message
    if (filePath) messageOptions.files.push(filePath);

    // Send the message to the channel
    await channel.send(messageOptions);
    process.stdout.write(`Message sent to channel: ${channel.name}\n`);
  } catch (err) {
    process.stderr.write(`Failed to send message to channel (ID: ${channelId}): ${err}\n`);
  }
}

/**
 * Clears error files from the temporary directory.
 * @author isahooman
 */
const clearErrorFiles = () => {
  // Ensure the temp error directory exists
  if (!fs.existsSync(errorDir)) {
    fs.mkdirSync(errorDir, { recursive: true });
    logMessage(levels.INFO, `Created temp error directory: [${errorDir}]`);
  }

  // Read the contents of the error directory
  fs.readdir(errorDir, (err, files) => {
    if (err) {
      logMessage(levels.ERROR, `Error reading error directory: ${err}`);
      return;
    }

    // Iterate through each file in the directory
    files.forEach(file => {
      // Check if the file matches the error naming format
      if (file.startsWith('error-') && file.endsWith('.js')) {
        // Delete the error file
        const filePath = path.join(errorDir, file);
        fs.unlink(filePath, unlinkErr => {
          if (unlinkErr) logMessage(levels.ERROR, `Error deleting error file ${file}: ${unlinkErr}`);
          else logMessage(levels.INFO, `Deleted error file: [${file}]`);
        });
      }
    });
  });
};

clearErrorFiles();

module.exports =
{
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

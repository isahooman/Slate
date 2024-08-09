const bot = require('../bot.js');
const chalk = require('chalk');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const logging = require('../config/logging.json');
const moment = require('moment');
const path = require('path');
const { readJSON5 } = require('./json5Parser.js');
const { ownerId, notifyOnReady, reportErrors, guildId, errorChannels, errorUsers, readyUsers, readyChannels } = readJSON5('./config/config.json5');

const logFile = path.join(__dirname, '..', 'bot.log');

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
 * Checks to see if logging levels are enabled
 * @param {number} level Logging Level
 * @returns {boolean} Active or not
 * @author isahooman
 */
function isLevelEnabled(level) {
  if (!Object.prototype.hasOwnProperty.call(logging, level)) {
    // If the level doesn't exist within the config, enable it by default
    logging[level] = true;
    try {
      fs.writeFileSync(path.join(__dirname, '../config/logging.json'), JSON.stringify(logging, null, 2), 'utf8');
    } catch (err) {
      process.stderr.write(`Error writing to logging config file: ${err}\n`);
    }
  }
  return logging[level];
}

/**
 * Toggles logging levels
 * @param {string} level Level Name
 * @param {boolean} enabled True or False
 * @author isahooman
 */
function setLevelEnabled(level, enabled) {
  if (Object.prototype.hasOwnProperty.call(levels, level)) {
    logging[level] = enabled;
    try {
      fs.writeFileSync(path.join(__dirname, '../config/logging.json'), JSON.stringify(logging, null, 2), 'utf8');
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
  if (!isLevelEnabled(level)) return;

  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  const logtime = chalk.cyan(`[${timestamp}]`);

  const logLevelColor = {
    INFO: chalk.grey,
    WARN: chalk.yellow,
    ERROR: chalk.red,
    DEBUG: chalk.blue,
    COMMAND: chalk.green,
    START: chalk.green,
    MESSAGE: chalk.hex('#FF69B4'),
    INTERACTION: chalk.hex('#FF69B4'),
    LOADING: chalk.hex('#17d5ad'),
  }[level];

  // Format file log output
  const fileformat = inputMessage =>
    inputMessage.split(/(?<!\\),/).map(part => {
      // Remove backslashes from the message
      part = part.replace(/\\,/g, ',');
      return part;
    }).join(',');

  // Format message for console output
  const formattedMessage = (() => {
    if (level === 'MESSAGE') {
      // Replace commas in messages to be preceded by a backslash
      let formatted = message.replace(/(?<!\\),/g, '\\,');
      // Remove replaced backslashes from the message
      formatted = formatted.replace(/\\(?=,)/g, '');
      // Color text within brackets
      formatted = formatted.replace(/\[(.*?)\]/g, (match, p1) => `[${chalk.hex('#ce987d')(p1)}]`);
      // Color text after colons
      if (formatted.includes(':')) {
        const [firstPart, ...rest] = formatted.split(':');
        formatted = `${chalk.white(firstPart)}:${chalk.hex('#bf00ff')(rest.join(':'))}`;
      }
      return formatted;
    } else {
      // Split message by commas but not if preceded by a backslash
      return message.split(/(?<!\\),(?![^[]*\])/).map(part => {
        // Remove preceding backslashes from the message
        part = part.replace(/\\,/g, ',');
        // Color text within brackets
        part = part.replace(/\[(.*?)\]/g, (match, p1) => `[${chalk.hex('#ce987d')(p1)}]`);
        // Color text after colons
        if (part.includes(':')) {
          const [firstPart, ...rest] = part.split(':');
          part = `${chalk.white(firstPart)}:${chalk.hex('#bf00ff')(rest.join(':'))}`;
        }
        return part;
      }).join(',');
    }
  })();

  // Console output
  const consoleOutput = `${logtime} <${logLevelColor(level)}> ${formattedMessage}`;
  process.stdout.write(`${consoleOutput}\n`);

  // Log file output
  const fileOutput = `<${timestamp}> <${level}> ${fileformat(message)}\n`;
  fs.appendFileSync(logFile, fileOutput);

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
function handleErrors(messageText, commandType = 'unknown', commandInfo = {}) {
  let errorEmbed = new EmbedBuilder().setColor(0xFF0000);
  let errorTitle = 'Error';

  try {
    // Prepare error report for slash commands
    if (commandType === 'slash' && commandInfo.interaction) {
      const interaction = commandInfo.interaction;
      errorTitle = `Error in slash command: ${interaction.commandName}`;
      errorEmbed.setTitle(errorTitle);

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

    // Send the prepared error report
    sendEmbed(errorEmbed, 'error');
  } catch (error) {
    process.stderr.write(`Error sending error embed:\n${error}\n`);
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
  sendEmbed(startEmbed, 'ready');
}

/**
 * Sends an embed to a specified target or list of targets.
 * @param {object} embed - The embed being sent
 * @param {string} [targetType] - Message target type:
 *  - 'error': Sends to owner(s) and error users
 *  - 'ready': Sends to owner(s) and ready users
 *  - Otherwise, sends only to owner(s).
 * @author isahooman
 */
function sendEmbed(embed, targetType = null) {
  // Wait for the client to become available
  const startTime = Date.now();
  while (Date.now() - startTime < 3000 && !bot.client.user) {
    // Do nothing, just wait
  }

  // Check if the client is available after the wait
  if (!bot.client.user) {
    process.stderr.write('Bot is not logged in, cannot send embed to user.\n');
    return;
  } else {
    process.stdout.write('Bot is logged in, ready to send embed.\n');
  }

  const { userId = null, channelId = null } = {};

  // Determine recipient list based on targetType
  let recipients = [...ownerId];
  if (targetType === 'error' && errorUsers) recipients.push(...errorUsers);
  if (targetType === 'ready' && readyUsers) recipients.push(...readyUsers);

  // Add target user if provided and not already included (prevent duplicated if id is stated multiple times)
  if (userId && !recipients.includes(userId)) recipients.push(userId);

  // Send embed to specific users
  recipients.forEach(recipientId => {
    sendEmbedToUser(embed, recipientId);
  });

  // Send embed to given channels
  if (channelId) try {
    sendEmbedToChannel(embed, [channelId]);
  } catch (err) {
    process.stderr.write(`Failed to send embed to channel (ID: ${channelId}): ${err}\n`);
  }
  else
    // Send to channel based on targetType
    if (targetType === 'error') try {
      sendEmbedToChannel(embed, errorChannels);
    } catch (err) {
      process.stderr.write(`Failed to send embed to error channel: ${err}\n`);
    }
    else if (targetType === 'ready') try {
      sendEmbedToChannel(embed, readyChannels);
    } catch (err) {
      process.stderr.write(`Failed to send embed to ready channel: ${err}\n`);
    }
}

/**
 * Sends an embed to target users specified by Id.
 * @param {object} embed - The embed being sent
 * @param {string} userId - Target user Ids
 * @author isahooman
 */
function sendEmbedToUser(embed, userId) {
  // Fetch user for given id
  bot.client.users.fetch(userId)
    .then(user => {
      if (!user) {
        process.stderr.write('Failed to find user for sending embed\n');
        return;
      }
      // Send embed to found user
      user.send({ embeds: [embed] })
        .then(() => process.stdout.write(`Embed sent to user: ${user.username}\n`))
        .catch(err => process.stderr.write(`Failed to send embed to user (ID: ${userId}): ${err}\n`));
    })
    .catch(err => process.stderr.write(`Failed to fetch user (ID: ${userId}): ${err}\n`));
}

/**
 * Sends an embed to target channels within the home guild specified by Id.
 * @param {object} embed - The embed being sent
 * @param {string[]} channelIds - Array of target channel Ids
 * @author isahooman
 */
function sendEmbedToChannel(embed, channelIds) {
  // Try to fetch the home guild
  const guild = bot.client.guilds.cache.get(guildId);
  if (!guild) {
    process.stderr.write('Failed to find guild for sending embed to channel\n');
    return;
  }

  // Loop through each channel ID
  if (channelIds && channelIds.length > 0) for (const channelId of channelIds) try {
    // Try to fetch given channel from home guild
    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      process.stderr.write(`Failed to find channel (ID: ${channelId}) for sending embed\n`);
      continue;
    }

    // Send the embed to the found channel
    channel.send({ embeds: [embed] });
    process.stdout.write(`Embed sent to channel: ${channel.name}\n`);
  } catch (err) {
    process.stderr.write(`Failed to send embed to channel (ID: ${channelId}): ${err}\n`);
  }
}

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

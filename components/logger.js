const { ownerId, notifyOnReady, reportErrors } = require('../config/config.json');
const logging = require('../config/logging.json');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const bot = require('../bot.js');

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
 */
function isLevelEnabled(level) {
  if (!Object.prototype.hasOwnProperty.call(logging, level)) {
    // If the level doesn't exist in logging.json, enable it by default
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
 * @param {import('discord.js').Client} client Discord Client
 * @param {commandType} commandType Command Type
 * @param {commandInfo} commandInfo Command Info
 * @returns {void|string} Void if disabled, String if enabled
 */
function logMessage(level, message, client = bot.client, commandType = 'unknown', commandInfo = {}) {
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

  if (level === levels.START && notifyOnReady) notifyReady(client, message);
  if (level === levels.ERROR && reportErrors) handleErrors(message, client, commandType, commandInfo);
}

/**
 * Error Handler
 * @param {string} messageText Message Text
 * @param {client} client - Discord Client
 * @param {commandType} commandType Command Type
 * @param {commandInfo} commandInfo Command Info
 */
function handleErrors(messageText, client = bot.client, commandType = 'unknown', commandInfo = {}) {
  let errorEmbed = new EmbedBuilder().setColor(0xFF0000);
  let errorTitle = 'Error';

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
  if (client) sendEmbed(errorEmbed, client);
}

/**
 * Notifies that the bot is ready.
 * @param {client} client - Discord client
 * @param {string} message - Log message to use in the description.
 */
function notifyReady(client, message) {
  // Create an embed to notify that the bot has started
  const startEmbed = new EmbedBuilder()
    .setColor('#17d5ad')
    .setTitle('Bot Ready!')
    .setDescription(message);

  // Send the ready embed
  sendEmbed(startEmbed, client);
}

/**
 * Sends an embed to all bot owners.
 * @param {EmbedBuilder} embed - The embed to send.
 * @param {client} client - Discord client
 */
function sendEmbed(embed, client) {
  // Iterate through each owner ID
  ownerId.forEach(Owners => {
    // Fetch the owners from ids in config
    client.users.fetch(Owners)
      .then(user => {
        // Send the embed
        user.send({ embeds: [embed] })
          .catch(err => {
            process.stderr.write(`Failed to send embed to owner (ID: ${Owners}): ${err}\n`);
          });
      })
      .catch(err => {
        process.stderr.write(`Failed to fetch owner (ID: ${Owners}): ${err}\n`);
      });
  });
}

module.exports =
{
  info: (message, client, commandType, commandInfo) => logMessage(levels.INFO, message, client, commandType, commandInfo),
  warn: (message, client, commandType, commandInfo) => logMessage(levels.WARN, message, client, commandType, commandInfo),
  error: (message, client, commandType, commandInfo) => logMessage(levels.ERROR, message, client, commandType, commandInfo),
  command: (message, client, commandType, commandInfo) => logMessage(levels.COMMAND, message, client, commandType, commandInfo),
  debug: (message, client, commandType, commandInfo) => logMessage(levels.DEBUG, message, client, commandType, commandInfo),
  start: (message, client, commandType, commandInfo) => logMessage(levels.START, message, client, commandType, commandInfo),
  message: (message, client, commandType, commandInfo) => logMessage(levels.MESSAGE, message, client, commandType, commandInfo),
  interaction: (message, client, commandType, commandInfo) => logMessage(levels.INTERACTION, message, client, commandType, commandInfo),
  loading: (message, client, commandType, commandInfo) => logMessage(levels.LOADING, message, client, commandType, commandInfo),
  setLevelEnabled,
  isLevelEnabled,
  levels,
};

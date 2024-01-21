/* eslint-disable no-console */
const { EmbedBuilder } = require('discord.js');
const config = require('./config.json');
const moment = require('moment');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, '..', 'bot.log');

const levels = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
  COMMAND: 'COMMAND',
};

// Check initial debug state when logger is used
let isDebugLoggingEnabled = config.debug;

// Check logger state when called
function isDebugEnabled() {
  return isDebugLoggingEnabled;
}

// Toggle debug logging
function setDebugEnabled(enabled) {
  isDebugLoggingEnabled = enabled;
  config.debug = enabled;
  try {
    fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing to config file: ${err}`);
  }
}

// Debug logging if debug is enabled
function debug(message, client, commandType = 'unknown', commandInfo = {}) {
  if (isDebugLoggingEnabled) logMessage(levels.DEBUG, message, client, commandType, commandInfo);
}

// Format and log messages
function logMessage(level, message, client, commandType = 'unknown', commandInfo = {}) {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  const logtime = chalk.cyan(`[${timestamp}]`);

  // Change log level color using chalk
  const logLevelsColors = {
    INFO: chalk.grey,
    WARN: chalk.yellow,
    ERROR: chalk.red,
    DEBUG: chalk.blue,
    COMMAND: chalk.green,
  };

  const logLevelColor = logLevelsColors[level] || chalk.white;

  // Format the log message
  const formattedMessage = message.split(',').map(part => {
    if (part.includes(':')) {
      const [firstPart, ...rest] = part.split(':');
      return `${chalk.white(firstPart)}:${chalk.hex('#bf00ff')(rest.join(':'))}`;
    } else {
      return chalk.whiteBright(part);
    }
  }).join(', ');

  // Output log to console
  const consoleLogEntry = `${logtime} <${logLevelColor(level)}> ${formattedMessage}`;
  console.log(consoleLogEntry);

  // Output log to log file
  const fileLogEntry = `<${timestamp}> <${level}> ${message}\n`;
  fs.appendFileSync(logFile, fileLogEntry);

  // If log level is "Error" start error handler
  if (level === levels.ERROR) handleErrors(message, client, commandType, commandInfo);
}

// Error handler
function handleErrors(messageText, client, commandType, commandInfo) {
  let errorEmbed = new EmbedBuilder().setColor(0xFF0000);
  let errorTitle = 'Error occurred';

  // Prepare error report for slash commands
  if (commandType === 'slash' && commandInfo.interaction) {
    const interaction = commandInfo.interaction;
    errorTitle = `Error in slash command: ${interaction.commandName}`;

    const args = interaction.options.data.map(opt => `\`${opt.name}\`: ${opt.value}`).join('\n') || 'None';

    errorEmbed.addFields(
      { name: 'User', value: interaction.user ? `${interaction.user.username} <@${interaction.user.id}>` : 'N/A' },
      { name: 'Channel', value: interaction.channelId ? `<#${interaction.channelId}> (ID: ${interaction.channelId})` : 'N/A' },
      { name: 'Server', value: interaction.guild ? `${interaction.guild.name} | ${interaction.guild.id}` : 'N/A' },
      { name: 'Arguments', value: args },
      { name: 'Error', value: messageText },
    );
  // eslint-disable-next-line brace-style
  }

  // Prepare error report for prefix commands
  else if (commandType === 'prefix' && commandInfo.context) {
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
  }

  errorEmbed.setTitle(errorTitle);

  // Send the prepared error report to the bot owner
  if (client) client.users.fetch(config.ownerId)
    .then(owner => owner.send({ embeds: [errorEmbed] }))
    .catch(err => {
      console.error(`Failed to send DM to owner: ${err}`);
    });
}

module.exports = {
  info: (message, client, commandType, commandInfo) => logMessage(levels.INFO, message, client, commandType, commandInfo),
  warn: (message, client, commandType, commandInfo) => logMessage(levels.WARN, message, client, commandType, commandInfo),
  error: (message, client, commandType, commandInfo) => logMessage(levels.ERROR, message, client, commandType, commandInfo),
  command: (message, client, commandType, commandInfo) => logMessage(levels.COMMAND, message, client, commandType, commandInfo),
  debug: (message, client, commandType, commandInfo) => debug(message, client, commandType, commandInfo),
  setDebugEnabled,
  isDebugEnabled,
};

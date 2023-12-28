const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { ownerId } = require('./config.json');
const configFile = path.join(__dirname, 'config.json');
const logFile = path.join(__dirname, 'bot.log');

let config = readConfig();

const levels = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG',
    COMMAND: 'COMMAND',
};

// Check debug state
let isDebugLoggingEnabled = config.debug || false;

function readConfig() {
    try {
        return JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (err) {
        console.error(`Error reading config file: ${err}`);
        return {};
    }
}

function writeConfig(updatedConfig) {
    try {
        fs.writeFileSync(configFile, JSON.stringify(updatedConfig, null, 4), 'utf8');
    } catch (err) {
        console.error(`Error writing to config file: ${err}`);
    }
}

// Debug logging
function debug(message, client, commandType = 'unknown', commandInfo = {}) {
    if (isDebugLoggingEnabled) logMessage(levels.DEBUG, message, client, commandType, commandInfo);
}

// Check if debug logging is enabled
function isDebugEnabled() {
    return isDebugLoggingEnabled;
}

// Toggle debug logging
function setDebugEnabled(enabled) {
    isDebugLoggingEnabled = enabled;
    config.debug = enabled;
    writeConfig(config);
}


function logMessage(level, message, client, commandType = 'unknown', commandInfo = {}) {
    const timestamp = new Date().toISOString();
    const logtime = chalk.cyan(`[${timestamp}]`);

    let logLevel;
    let formattedMessage;

    // Colors~~
    switch (level) {
        case levels.INFO:
            logLevel = chalk.grey(level);
            formattedMessage = chalk.white(message);
            break;
        case levels.WARN:
            logLevel = chalk.yellow(level);
            formattedMessage = chalk.yellow(message);
            break;
        case levels.ERROR:
            logLevel = chalk.bgRed(level);
            formattedMessage = chalk.red(message);
            break;
        case levels.DEBUG:
            logLevel = chalk.blue(level);
            formattedMessage = chalk.blue(message);
            break;
        case levels.COMMAND:
            logLevel = chalk.green(level);
            formattedMessage = chalk.green(message);
            break;
        default:
            logLevel = level;
            formattedMessage = message;
    }

    const consoleLogEntry = `${logtime} <${logLevel}> ${formattedMessage}`;
    console.log(consoleLogEntry);

    const fileLogEntry = `<${timestamp}> <${level}> ${message}\n`;
    fs.appendFileSync(logFile, fileLogEntry);

    if (level === levels.ERROR) handleErrors(message, client, commandType, commandInfo);
}

// Error report handler
function handleErrors(messageText, client, commandType, commandInfo) {
    let errorEmbed = new EmbedBuilder().setColor(0xFF0000);
    let errorTitle;

    // Slash command handler
    if (commandType === 'slash' && commandInfo.interaction) {
        const interaction = commandInfo.interaction;
        errorTitle = `Error in slash command: ${interaction.commandName}`;

        const args = interaction.options.data.map(opt => `${opt.name}: ${opt.value}`).join('\n') || 'None';

        errorEmbed.addFields(
            { name: 'User', value: interaction.user ? `${interaction.user.username} <@${interaction.user.id}>` : 'N/A' },
            { name: 'Channel', value: interaction.channelId ? `<#${interaction.channelId}> (ID: ${interaction.channelId})` : 'N/A' },
            { name: 'Server', value: interaction.guild ? `${interaction.guild.name} | ${interaction.guild.id}` : 'N/A' },
            { name: 'Arguments', value: args },
            { name: 'Error', value: messageText },
        );
    }

    // prefix command handler
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
    client.users.fetch(ownerId)
        .then(owner => owner.send({ embeds: [errorEmbed] }))
        .catch(err => console.error(`Failed to send DM to owner: ${err}`));
}

module.exports = {
    info: (message, client, commandType, commandInfo) => logMessage(levels.INFO, message, client, commandType, commandInfo),
    warn: (message, client, commandType, commandInfo) => logMessage(levels.WARN, message, client, commandType, commandInfo),
    error: (message, client, commandType, commandInfo) => logMessage(levels.ERROR, message, client, commandType, commandInfo),
    debug: (message, client, commandType, commandInfo) => debug(message, client, commandType, commandInfo),
    command: (message, client, commandType, commandInfo) => logMessage(levels.COMMAND, message, client, commandType, commandInfo),
    setDebugEnabled,
    isDebugEnabled,
};

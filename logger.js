const { EmbedBuilder } = require('discord.js');
const config = require('./config.json');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'bot.log');

const levels = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG',
    COMMAND: 'COMMAND',
};

// Check debug state
let isDebugLoggingEnabled = config.debug;

// Debug logging
function debug(message, client, commandType = 'unknown', commandInfo = {}) {
    if (isDebugLoggingEnabled) logMessage(levels.DEBUG, message, client, commandType, commandInfo);
}

// Check if debug logging is enabled
function isDebugEnabled() {
    return isDebugLoggingEnabled;
}

// Toggle debug logging (saved in in config.json)
function setDebugEnabled(enabled) {
    isDebugLoggingEnabled = enabled;
    config.debug = enabled;
    try {
        fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(config, null, 4), 'utf8');
    } catch (err) {
        console.error(`Error writing to config file: ${err}`);
    }
}

// Formats logger output
function logMessage(level, message, client, commandType = 'unknown', commandInfo = {}) {
    const timestamp = new Date().toISOString();
    const logtime = chalk.cyan(`[${timestamp}]`);

    let logLevel;
    let formattedMessage;

    // Changes console output color based on level
    switch (level) {
        case levels.INFO:
            logLevel = chalk.grey(level);
            break;
        case levels.WARN:
            logLevel = chalk.yellow(level);
            break;
        case levels.ERROR:
            logLevel = chalk.bgRed(level);
            break;
        case levels.DEBUG:
            logLevel = chalk.blue(level);
            break;
        case levels.COMMAND:
            logLevel = chalk.green(level);
            break;
        default:
            logLevel = level;
    }

    // Change console out
    if (message.includes(':')) {
        const [firstPart, ...rest] = message.split(':');
        formattedMessage = `${chalk.white(firstPart)}:${chalk.hex('#bf00ff')(rest.join(':'))}`;
    } else {
        // If no colon is found, format the entire message in white
        formattedMessage = chalk.whiteBright(message);
    }

    // Outputs colored message to console
    const consoleLogEntry = `${logtime} <${logLevel}> ${formattedMessage}`;
    console.log(consoleLogEntry);

    // Outputs normal log to file
    const fileLogEntry = `<${timestamp}> <${level}> ${message}\n`;
    fs.appendFileSync(logFile, fileLogEntry);

    if (level === levels.ERROR) handleErrors(message, client, commandType, commandInfo);
}

// Error reporter handling
function handleErrors(messageText, client, commandType, commandInfo) {
    let errorEmbed = new EmbedBuilder().setColor(0xFF0000);
    let errorTitle;

    // Prepare error report for slash commands
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

    // Send error report
    errorEmbed.setTitle(errorTitle);
    client.users.fetch(config.ownerId)
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

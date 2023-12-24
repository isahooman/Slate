const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const {ownerId} = require('./config.json')
const configFile = path.join(__dirname, 'config.json');
const logFile = path.join(__dirname, 'bot.log');

let config = readConfig();

const levels = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    DEBUG: 'DEBUG',
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

function logMessage(level, message, client, commandType = 'unknown', commandInfo = {}) {
    const timestamp = new Date().toISOString();

    // Format the timestamp
    const logtime = chalk.cyan(`[${timestamp}]`);

    // change color based on level
    let logLevel;
    switch (level) {
        case levels.INFO:
            logLevel = chalk.white(level);
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
        default:
            logLevel = level; // No color for unknown level
    }

    // Format the log message
    const formattedMessage = chalk.hex('#f3de8e')(message);

    // Combine parts for the console log entry
    const consoleLogEntry = `${logtime} <${logLevel}> ${formattedMessage}`;
    console.log(consoleLogEntry);

    // Log format for file
    const fileLogEntry = `<${timestamp}> <${level}> ${message}\n`;
    fs.appendFileSync(logFile, fileLogEntry);
}
function handlePrefixCommand(level, message, client, { commandName, args, context }) {
    // Collect and log details for prefix commands
    if (level === levels.INFO || level === levels.WARN) {
        const additionalLog = `Prefix Command: ${commandName}, Args: ${args.join(' ')}, User: ${context.author.id}, Channel: ${context.channel.id}\n`;
        console.log(chalk.gray(additionalLog));
        fs.appendFileSync(logFile, additionalLog);
    }

    if (level === levels.ERROR) {
        // Prefix reporting
        const errorLog = `Error in prefix command: ${commandName}, User: ${context.author.id}, Channel: ${context.channel.id}, Error: ${message}\n`;
        console.error(chalk.red(errorLog));
        fs.appendFileSync(logFile, errorLog);

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(`Error in prefix command: ${commandName}`)
            .addFields(
                { name: 'User', value: `${context.author.username} <@${context.author.id}>` },
                { name: 'Channel', value: `<#${context.channel.id}> (ID: ${context.channel.id})` },
                { name: 'Error', value: `${message}` }
            );

        client.users.fetch(ownerId).then(owner => {
            owner.send({ embeds: [errorEmbed] });
        }).catch(err => {
            console.error(`Failed to send DM to owner: ${err}`);
        });
    }
}

function handleSlashCommand(level, message, client, { interaction }) {
    // Handles slash command reporting
    if (level === levels.ERROR) {
        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(`Error in slash command: ${interaction?.commandName}`)
            .addFields(
                { name: 'User', value: interaction?.user ? `${interaction.user.username} <@${interaction.user.id}>` : 'N/A' },
                { name: 'Channel', value: interaction?.channelId ? `<#${interaction.channelId}>\nID: ${interaction.channelId}` : 'N/A' },
                { name: 'Server', value: interaction?.guild ? `${interaction.guild.name}\nID: ${interaction.guild.id}` : 'N/A' },
                { name: 'Error', value: `${message}` }
            );

        client.users.fetch(ownerId).then(owner => {
            owner.send({ embeds: [errorEmbed] });
        }).catch(err => {
            console.error(`Failed to send DM to owner: ${err}`);
        });
    }
}


// Debug logging
function debug(message, client, commandType = 'unknown', commandInfo = {}) {
    if (isDebugLoggingEnabled) {
        logMessage(levels.DEBUG, message, client, commandType, commandInfo);
    }
}

// toggle debug logging
function setDebugEnabled(enabled) {
    isDebugLoggingEnabled = enabled;
    config.debug = enabled;
    writeConfig(config);
}

// check if debug logging is enabled
function isDebugEnabled() {
    return isDebugLoggingEnabled;
}

module.exports = {
    info: (message, client, commandType, commandInfo) => logMessage(levels.INFO, message, client, commandType, commandInfo),
    warn: (message, client, commandType, commandInfo) => logMessage(levels.WARN, message, client, commandType, commandInfo),
    error: (message, client, commandType, commandInfo) => logMessage(levels.ERROR, message, client, commandType, commandInfo),
    debug: (message, client, commandType, commandInfo) => debug(message, client, commandType, commandInfo),
    setDebugEnabled,
    isDebugEnabled: () => isDebugLoggingEnabled,
};

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

// Read the initial debug state from config.json
let isDebugLoggingEnabled = config.debug || false;

function readConfig() {
    try {
        return JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (err) {
        console.error(`Error reading config file: ${err}`);
        return {}; // Default to an empty object if there's an error
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
    let logEntry = `[${timestamp}] [${level}] ${message}\n`;

    // Apply chalk colors based on the level
    switch (level) {
        case levels.INFO:
            logEntry = chalk.white(logEntry);
            break;
        case levels.WARN:
            logEntry = chalk.yellow(logEntry);
            break;
        case levels.ERROR:
            logEntry = chalk.red(logEntry);
            break;
        case levels.DEBUG:
            logEntry = chalk.blue(logEntry);
            break;
    }

    // Output to file and console 
    console.log(logEntry);
    fs.appendFileSync(logFile, logEntry);

    // Switch handler depending on if command is slash or prefix
    switch (commandType) {
        case 'prefix':
            handlePrefixCommand(level, message, client, commandInfo);
            break;
        case 'slash':
            handleSlashCommand(level, message, client, commandInfo);
            break;
    }
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
        console.error(chalk.red(errorLog)); // Error log is red
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


// Debug level logging function
function debug(message, client, commandType = 'unknown', commandInfo = {}) {
    if (isDebugLoggingEnabled) {
        logMessage(levels.DEBUG, message, client, commandType, commandInfo);
    }
}

// Function to toggle debug logging
function setDebugEnabled(enabled) {
    isDebugLoggingEnabled = enabled;
    config.debug = enabled;
    writeConfig(config);
}

// Function to check if debug logging is enabled
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

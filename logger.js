const { EmbedBuilder } = require('discord.js');
const { ownerId } = require('./config.json');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'bot.log');

const levels = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
};

function logMessage(level, message, client, interaction) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;

    // Output to console
    console.log(logEntry);

    // Output to file
    fs.appendFileSync(logFile, logEntry);

    // If error level send report to owner
    if (level === levels.ERROR && client && interaction) {
        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(`Error in command: ${interaction.commandName}`)
            .addFields(
                { name: 'User', value: `${interaction.user.username} <@${interaction.user.id}>` },
                { name: 'Channel', value: `<#${interaction.channelId}> (ID: ${interaction.channelId})` },
                { name: 'Server', value: `${interaction.guild.name} | ${interaction.guild.id}` },
                { name: 'Error', value: `${message}` }
            );

        client.users.fetch(ownerId).then(owner => {
            owner.send({ embeds: [errorEmbed] });
        }).catch(err => {
            console.error(`Failed to send DM to owner: ${err}`);
        });
    }
}

module.exports = {
    info: (message, client) => logMessage(levels.INFO, message, client),
    warn: (message, client) => logMessage(levels.WARN, message, client),
    error: (message, client, interaction) => logMessage(levels.ERROR, message, client, interaction),
};
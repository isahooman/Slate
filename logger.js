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

function logMessage(level, message, client, interaction, commandType, commandArgs) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;

    // Output to console
    console.log(logEntry);

    // Output to file
    fs.appendFileSync(logFile, logEntry);

    // If error level send report to owner (currentlky only works for slash)
    if (level === levels.ERROR && client) {
        const commandName = interaction ? interaction.commandName : commandArgs[0];
        const errorTitle = `Error in ${commandType} command: ${commandName}`;
        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(errorTitle)
            .addFields(
                { name: 'User', value: interaction ? `${interaction.user.username} <@${interaction.user.id}>` : 'N/A' },
                { name: 'Channel', value: interaction ? `<#${interaction.channelId}> (ID: ${interaction.channelId})` : 'N/A' },
                { name: 'Server', value: interaction ? `${interaction.guild.name} | ${interaction.guild.id}` : 'N/A' },
                { name: 'Error', value: `${message}` }
            );

        if (interaction && commandType === 'slash') {
            errorEmbed.addFields({ name: 'Arguments', value: interaction.options.data.map(opt => `${opt.name}: ${opt.value}`).join('\n') || 'None' });
        }

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
    error: (message, client, interaction, commandType = 'unknown', commandArgs = []) => logMessage(levels.ERROR, message, client, interaction, commandType, commandArgs),
};

const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../logger');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Retrieve the latest bot logs.')
        .addIntegerOption(option => option.setName('lines')
            .setDescription('Number of lines to retrieve')
            .setRequired(true)),

    async execute(interaction) {
        try {
            // Log the command execution
            logger.debug('Reading bot logs', interaction.client, 'slash', { interaction });

            // Get number of lines from interaction option
            const linesToRetrieve = interaction.options.getInteger('lines');
            if (linesToRetrieve <= 0) return interaction.reply({ content: 'Please enter a valid number of lines.', ephemeral: false });

            // Read log file and trim to remove trailing newlines
            const logFilePath = path.join(__dirname, '../../../bot.log');
            let logData = fs.readFileSync(logFilePath, 'utf8').trim();

            // Get the last specified number of lines from logs
            const logLines = logData.split('\n').slice(-linesToRetrieve).join('\n');

            // Send the logs
            await interaction.reply({ content: `Last ${linesToRetrieve} lines of logs:\n\`\`\`\n${logLines}\n\`\`\``, ephemeral: false });
        } catch (error) {
            logger.error(error);
            await interaction.reply({ content: 'Error reading logs.', ephemeral: true });
        }
    },
};

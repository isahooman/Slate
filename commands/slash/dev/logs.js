const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../logger.js');
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
            const linesToRetrieve = interaction.options.getInteger('lines');
            if (linesToRetrieve <= 0) {
                return interaction.reply({ content: 'Please enter a valid number of lines to retrieve (greater than 0).', ephemeral: true });
            }

            const logFilePath = path.join(__dirname, '../../../bot.log'); 
            const logData = fs.readFileSync(logFilePath, 'utf8');
            const logLines = logData.split('\n').slice(-linesToRetrieve).join('\n');
            await interaction.reply({ content: `Here are the last ${linesToRetrieve} lines of logs:\n\`\`\`\n${logLines}\n\`\`\``, ephemeral: true });
        } catch (error) {
            logger.error(error);
            await interaction.reply({ content: 'An error occurred while reading the logs.', ephemeral: true });
        }
    },
};
const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kill')
        .setDescription('Terminates the bot process'),

        async execute(interaction) {
        try {
            // Sending a confirmation message before shutting down
            await interaction.reply({ content: 'Shutting down...', ephemeral: false });

            // Logout of discord
            await interaction.client.destroy();

            // Kill the process
            process.exit();
        } catch (error) {
            logger.error('Error occurred while shutting down:', error);
        }
    },
};

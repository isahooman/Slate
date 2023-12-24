const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Toggles debug level logging'),

    async execute(interaction) {
        const currentDebugState = logger.isDebugEnabled();
        // Log current debug state
        logger.debug(`Current debug state before toggling: ${currentDebugState}`, interaction.client, 'slash', { interaction });

        // Toggle the debug state
        logger.setDebugEnabled(!currentDebugState);

        // Log new debug state
        logger.debug(`New debug state after toggling: ${!currentDebugState}`, interaction.client, 'slash', { interaction });

        // Respond to the interaction
        await interaction.reply(`Debug logging is now ${currentDebugState ? 'disabled' : 'enabled'}.`);
    },
};

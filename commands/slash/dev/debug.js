const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Toggles debug level logging'),

    async execute(interaction) {
        const currentDebugState = logger.isDebugEnabled();
        
        // toggle the debug state
        logger.setDebugEnabled(!currentDebugState);

        // tell user new state
        await interaction.reply(`Debug logging is now ${currentDebugState ? 'disabled' : 'enabled'}.`);
    },
};

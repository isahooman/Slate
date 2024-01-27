const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../components/logger.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Toggles debug level logging'),

  async execute(interaction) {
    // Get the current debug state
    const currentDebugState = logger.isDebugEnabled();

    // Toggle debug logging
    logger.setDebugEnabled(!currentDebugState);

    // Inform the user about the updated state
    await interaction.reply(`Debug logging is now ${currentDebugState ? 'disabled' : 'enabled'}.`);
  },
};

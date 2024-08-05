const { logger } = require('../../../../components/loggerUtil.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Terminates the bot process')
    .addBooleanOption(option => option.setName('unregister')
      .setDescription('Unregister all slash commands before shutting down')
      .setRequired(false),
    ),
  category: 'owner',
  async execute(interaction) {
    try {
      // Logging the start of the shutdown process
      logger.debug('[Shutdown Command] Starting shutdown process...');

      // Sending a confirmation message before shutting down
      await interaction.reply('Shutting down...');

      // Sends shutdown signal
      process.emit('SIGINT');
    } catch (error) {
      logger.error('[Shutdown Command] Error occurred while shutting down:', error);
    }
  },
};

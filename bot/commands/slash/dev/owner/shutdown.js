const logger = require('../../../../components/util/logger.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Terminates the bot process'),
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
      throw new Error('[Shutdown Command] Error occurred while shutting down:', error);
    }
  },
};

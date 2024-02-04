const logger = require('../../../components/logger.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kill')
    .setDescription('Terminates the bot process'),

  async execute(interaction) {
    try {
      // Logging the start of the shutdown process
      logger.debug('[Kill Command] Starting shutdown process...');

      // Sending a confirmation message before shutting down
      await interaction.reply('Shutting down...');

      // Logout of Discord
      logger.debug('[Kill Command] Destroying Discord client...');
      await interaction.client.destroy();

      // Kill the process
      logger.debug('[Kill Command] Exiting the process...');
      process.exit();
    } catch (error) {
      logger.error('[Kill Command] Error occurred while shutting down:', error);
    }
  },
};

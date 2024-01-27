const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../components/logger.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kill')
    .setDescription('Terminates the bot process'),

  async execute(interaction) {
    try {
      // Logging the start of the shutdown process
      logger.debug('Starting shutdown process...');

      // Sending a confirmation message before shutting down
      await interaction.reply('Shutting down...');

      // Logout of Discord
      logger.debug('Destroying Discord client...');
      await interaction.client.destroy();

      // Kill the process
      logger.debug('Exiting the process...');
      process.exit();
    } catch (error) {
      logger.error('Error occurred while shutting down:', error);
    }
  },
};

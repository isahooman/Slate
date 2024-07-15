const logger = require('../../../components/logger.js');
const { SlashCommandBuilder } = require('discord.js');
const { undeploy } = require('../../../components/undeploy.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shutdown')
    .setDescription('Terminates the bot process')
    .addBooleanOption(option => option.setName('unregister')
      .setDescription('Unregister all slash commands before shutting down')
      .setRequired(false),
    ),

  async execute(interaction) {
    try {
      // Logging the start of the shutdown process
      logger.debug('[Kill Command] Starting shutdown process...');

      // Sending a confirmation message before shutting down
      await interaction.reply('Shutting down...');

      // Logout of Discord
      logger.debug('[Kill Command] Destroying Discord client');
      await interaction.client.destroy();

      // Unregister all slash commands if option is selected
      if (interaction.options.getBoolean('unregister')) {
        logger.debug('[Kill Command] Unregistering slash commands');
        await undeploy();
      }

      // Kill the process
      logger.debug('[Kill Command] Exiting the process');
      process.exit();
    } catch (error) {
      logger.error('[Kill Command] Error occurred while shutting down:', error);
    }
  },
};

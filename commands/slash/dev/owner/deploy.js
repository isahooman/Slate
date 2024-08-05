const { deployCommands } = require('../../../../components/loader.js');
const { logger } = require('../../../../components/loggerUtil.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('Deploy all slash commands.'),
  category: 'owner',

  async execute(interaction) {
    try {
      // Log the start of the deployment
      logger.debug(`[Deploy Command] Starting to deploy commands`);

      // Call the deployCommands function
      await deployCommands();

      // Reply to the interaction
      await interaction.reply('Slash commands deployed successfully!');
    } catch (error) {
      logger.error(`[Deploy Command] Error while deploying commands: ${error}`);
      await interaction.reply('Failed to deploy slash commands.');
    }
  },
};

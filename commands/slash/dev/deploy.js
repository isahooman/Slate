const { SlashCommandBuilder } = require('discord.js');
const deployCommands = require('../../../components/deploy.js');
const logger = require('../../../components/logger.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('Deploys global and guild-specific commands'),

  async execute(interaction) {
    try {
      // Log the start of the deployment
      logger.debug(`Starting to deploy commands`);

      // Call the deployCommands function
      await deployCommands();

      // Reply to the interaction
      await interaction.reply('Slash commands deployed successfully!');
    } catch (error) {
      logger.error(`Deployment error: ${error}`);
      await interaction.reply('Failed to deploy slash commands.');
    }
  },
};

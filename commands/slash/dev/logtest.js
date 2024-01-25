const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../util/logger.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logtest')
    .setDescription('Test logger levels')
    .addStringOption(option =>
      option.setName('output')
        .setDescription('Text to log')
        .setRequired(true)),

  async execute(interaction) {
    try {
      const outputText = interaction.options.getString('output');

      // Send log of every level with the input
      logger.info(outputText);
      logger.warn(outputText);
      logger.debug(outputText);
      logger.error(outputText);
      logger.command(outputText);
    } catch (error) {
      await interaction.reply('Logged messages at different levels.');
    }
  },
};

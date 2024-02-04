const logger = require('../../../components/logger.js');
const { SlashCommandBuilder } = require('discord.js');

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
      logger.info(`[Logtest Command] ${outputText}`);
      logger.warn(`[Logtest Command] ${outputText}`);
      logger.debug(`[Logtest Command] ${outputText}`);
      logger.error(`[Logtest Command] ${outputText}`);
      logger.command(`[Logtest Command] ${outputText}`);
    } catch (error) {
      await interaction.reply('Logged messages at different levels.');
    }
  },
};

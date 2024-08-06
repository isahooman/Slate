const { SlashCommandBuilder } = require('discord.js');
const { logger } = require('../../../../components/loggerUtil.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logtest')
    .setDescription('Test logger levels')
    .addStringOption(option => option.setName('output')
      .setDescription('Text to log')
      .setRequired(true)),
  category: 'owner',
  async execute(interaction) {
    try {
      const outputText = interaction.options.getString('output');
      // Send log of every level with the input
      logger.info(`[LogTest Command] ${outputText}`);
      logger.warn(`[LogTest Command] ${outputText}`);
      logger.error(`[LogTest Command] ${outputText}`);
      logger.debug(`[LogTest Command] ${outputText}`);
      logger.command(`[LogTest Command] ${outputText}`);
      logger.start(`[LogTest Command] ${outputText}`);
      logger.message(`[LogTest Command] ${outputText}`);
      logger.interaction(`[LogTest Command] ${outputText}`);
      logger.loading(`[LogTest Command] ${outputText}`);

      interaction.reply('Logged messages at different levels.');
    } catch (error) {
      await interaction.reply('Logged messages at different levels.');
    }
  },
};

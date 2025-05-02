const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../../components/util/logger.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logtest')
    .setDescription('Test logger levels')
    .addStringOption(option => option.setName('output')
      .setDescription('Text to log')
      .setRequired(true)),
  category: 'owner',
  async execute(interaction) {
    // Get test message from options
    const outputText = interaction.options.getString('output');
    if (!outputText) return interaction.reply('Please provide text to log.');

    // Test logging for each level
    Object.keys(logger.levels).forEach(level => {
      const logLevel = level.toLowerCase();
      if (typeof logger[logLevel] === 'function') logger[logLevel](`[LogTest Command] ${outputText}`);
    });

    // Confirmation
    await interaction.reply('Logged messages at different levels.');
  },
};

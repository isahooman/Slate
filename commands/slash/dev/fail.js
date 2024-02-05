const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../../components/logger.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fail')
    .setDescription('Intentionally fail for testing.'),

  async execute(interaction) {
    try {
      // Intentional failure for testing
      throw new Error('This is a test error.');
    } catch (error) {
      // Log the error
      logger.error(`[Fail Command] ${error.message}`);
      await interaction.reply('Failed.');
    }
  },
};

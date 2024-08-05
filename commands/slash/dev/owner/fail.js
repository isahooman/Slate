const { SlashCommandBuilder } = require('discord.js');
const { logger } = require('../../../../components/loggerUtil.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fail')
    .setDescription('Intentionally fail for testing.'),
  cooldowns: {
    user: 3000,
    guild: 4000,
    global: 5000,
  },

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

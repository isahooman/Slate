const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../../util/logger.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fail')
    .setDescription('Intentionally fail for testing.'),

  async execute(interaction) {
    try {
      // Simulate an intentional failure for testing
      throw new Error('This is a test error.');
    } catch (error) {
      // Log the error
      logger.error(`${error.message}`, interaction.client, 'slash', { interaction });
      await interaction.reply('test');
    }
  },
};

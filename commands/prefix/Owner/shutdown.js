const logger = require('../../../components/logger.js');
const { aliases } = require('./logtoggle.js');

module.exports = {
  name: 'shutdown',
  usage: 'shutdown',
  category: 'Owner',
  description: 'Terminates the bot',
  aliases: ['kill', 'sd'],

  async execute(message) {
    try {
      // Send confirmation message
      await message.channel.send('Shutting down...');

      // Logout of Discord
      await message.client.destroy();

      // Kill the process
      process.exit();
    } catch (error) {
      logger.error('[Kill Command] Error occurred while shutting down:', error);
    }
  },
};

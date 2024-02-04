const logger = require('../../../components/logger.js');

module.exports = {
  name: 'kill',
  usage: 'kill',
  category: 'Owner',
  description: 'Terminates the bot',

  async execute(message) {
    try {
      // Wait while sending confirmation message
      await message.channel.send('Shutting down...');

      // Logout of Discord
      message.client.destroy();

      // Kill the process
      process.exit();
    } catch (error) {
      logger.error('[Kill Command] Error occurred while shutting down:', error);
    }
  },
};

const logger = require('../../../util/logger.js');

module.exports = {
  name: 'kill',
  category: 'Owner',
  usage: 'kill',
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
      logger.error('Error occurred while shutting down:', error);
    }
  },
};

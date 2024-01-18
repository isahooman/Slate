const { ownerId } = require('../../../util/logger.js');
const logger = require('../../../util/logger.js');

module.exports = {
  name: 'kill',
  description: 'Terminates the bot',

  async execute(message) {
    // Check if the user is bot owner
    if (message.author.id !== ownerId) {
      // Do nothing if the user is not the owner
      return;
    }

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

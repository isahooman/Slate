const logger = require('../../../components/util/logger.js');

module.exports = {
  name: 'shutdown',
  usage: 'shutdown [true]',
  category: 'Owner',
  aliases: ['sd'],
  allowDM: true,
  description: 'Terminates the bot.',

  async execute(message) {
    try {
      logger.debug('[Shutdown Command] Starting shutdown process...');

      // Send confirmation message
      await message.channel.send('Shutting down...');

      // Send shutdown signal
      process.emit('SIGINT');
    } catch (error) {
      throw new Error('[Shutdown Command] Error occurred while shutting down:', error);
    }
  },
};

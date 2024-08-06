const { logger } = require('../../../components/loggerUtil.js');

module.exports = {
  name: 'shutdown',
  usage: 'shutdown [true]',
  category: 'Owner',
  aliases: ['kill', 'sd'],
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
      logger.error('[Shutdown Command] Error occurred while shutting down:', error);
    }
  },
};

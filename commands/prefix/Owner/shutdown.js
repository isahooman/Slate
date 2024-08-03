const { logger } = require('../../../components/loggerUtil.js');
const { undeploy } = require('../../../components/undeploy.js');

module.exports = {
  name: 'shutdown',
  usage: 'shutdown [true]',
  category: 'Owner',
  aliases: ['kill', 'sd'],
  allowDM: true,
  description: 'Terminates the bot.',

  async execute(message, args) {
    try {
      // Send confirmation message
      await message.channel.send('Shutting down...');

      // Unregister commands if "true" is passed
      if (args[0] === 'true') await undeploy();
      logger.debug('[Shutdown Command] Unregistered commands');

      // Logout of Discord
      await message.client.destroy();

      // Kill the process
      process.exit();
    } catch (error) {
      logger.error('[Shutdown Command] Error occurred while shutting down:', error);
    }
  },
};

const { logger } = require('../../../components/loggerUtil.js');

module.exports = {
  name: 'fail',
  usage: 'fail',
  category: 'Owner',
  allowDM: true,
  description: 'Intentionally throw an error for testing.',
  cooldowns: {
    user: 2500,
    guild: 5000,
    global: 10000,
  },
  execute(message) {
    try {
      // Intentional failure
      throw new Error('This is a test error.');
    } catch (error) {
      // Log the failure
      logger.error(`[Fail Command] ${error.message}`);
      message.reply('Task Failed Successfully.');
    }
  },
};

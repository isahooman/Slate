const logger = require('../../../components/logger.js');

module.exports = {
  name: 'fail',
  usage: 'fail',
  category: 'Owner',
  description: 'Intentionally fail for testing.',
  cooldowns: {
    user: 5000,
    guild: 10000,
    global: 15000,
  },

  execute(message) {
    try {
      // Intentional failure
      throw new Error('This is a test error.');
    } catch (error) {
      // Log the failure
      logger.error(`[Fail Command] ${error.message}`);
      message.reply('Failed.');
    }
  },
};

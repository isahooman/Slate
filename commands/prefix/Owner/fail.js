const logger = require('../../../util/logger.js');

module.exports = {
  name: 'fail',
  usage: 'fail',
  category: 'Owner',
  description: 'Intentionally fail for testing.',
  execute(message) {
    try {
      // Intentional failure for testing
      throw new Error('This is a test error.');
    } catch (error) {
      // Log the error
      logger.error(error.message);
      message.reply('Failed.');
    }
  },
};

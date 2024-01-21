const logger = require('../../../util/logger.js');

module.exports = {
  name: 'fail',
  description: 'Intentionally fail for testing.',
  execute(message) {
    try {
      // Simulate an intentional failure for testing
      throw new Error('This is a test error.');
    } catch (error) {
      // Log the error
      logger.error(`${error.message}`, message.client, 'slash', { interaction: null });
      message.reply('Test error simulated.');
    }
  },
};

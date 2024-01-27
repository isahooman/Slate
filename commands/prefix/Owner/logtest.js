const logger = require('../../../components/logger.js');

module.exports = {
  name: 'logtest',
  usage: 'logtest <message>',
  category: 'Owner',
  description: 'Test logger levels',
  execute(message, args) {
    try {
      // Get text input from command arguments
      const outputText = args.join(' ');
      if (!outputText) return message.reply('Please provide text to log.');

      // Send log of every level with the input
      logger.info(outputText);
      logger.warn(outputText);
      logger.debug(outputText);
      logger.error(outputText);
      logger.command(outputText);

      message.reply('Logged messages at different levels.');
    } catch (error) {
      message.reply('Logged messages at different levels.');
    }
  },
};

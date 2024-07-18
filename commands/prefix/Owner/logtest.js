const { logger } = require('../../../components/loggerUtil.js');

module.exports = {
  name: 'logtest',
  usage: 'logtest <message>',
  category: 'Owner',
  description: 'Test logger levels',
  allowDM: true,
  execute(message, args) {
    try {
      // Get text input from command arguments
      const outputText = args.join(' ');
      if (!outputText) return message.reply('Please provide text to log.');

      // Send log of every level with the input
      logger.info(`[LogTest Command] ${outputText}`);
      logger.warn(`[LogTest Command] ${outputText}`);
      logger.error(`[LogTest Command] ${outputText}`);
      logger.debug(`[LogTest Command] ${outputText}`);
      logger.command(`[LogTest Command] ${outputText}`);
      logger.start(`[LogTest Command] ${outputText}`);
      logger.message(`[LogTest Command] ${outputText}`);
      logger.interaction(`[LogTest Command] ${outputText}`);
      logger.loading(`[LogTest Command] ${outputText}`);

      message.reply('Logged messages at different levels.');
    } catch (error) {
      message.reply('Logged messages at different levels.');
    }
  },
};

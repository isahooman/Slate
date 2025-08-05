const logger = require('../../../components/util/logger.js');

module.exports = {
  name: 'logtest',
  usage: 'logtest <message>',
  category: 'Owner',
  description: 'Test logger levels',
  allowDM: true,
  execute(message, args) {
    // Get test message from arguments
    const outputText = args.join(' ');
    if (!outputText) return message.reply('Please provide text to log.');

    // Test logging for each level
    Object.keys(logger.levels).forEach(level => {
      const logLevel = level.toLowerCase();
      if (typeof logger[logLevel] === 'function') logger[logLevel](`[LogTest Command] ${outputText}`);
    });

    // Confirmation
    message.reply('Logged messages at different levels.');
  },
};

const logger = require('../../../util/logger.js');

module.exports = {
  name: 'debug',
  description: 'Toggles debug level logging',
  execute(message) {
    // Get the current debug state
    const currentDebugState = logger.isDebugEnabled();

    // Toggle debug logging
    logger.setDebugEnabled(!currentDebugState);

    // Inform the user about the new state
    message.reply(`Debug logging is now ${currentDebugState ? 'disabled' : 'enabled'}.`);
  },
};

const logger = require('../../../components/util/logger.js');

module.exports = {
  name: 'logtoggle',
  usage: 'log <level>',
  aliases: ['ltoggle', 'togglelog'],
  category: 'Owner',
  allowDM: true,
  description: 'Toggles logging for the specified level',
  execute(message, args) {
    // Get the logging level from the command arguments.
    const level = args[0]?.toUpperCase();

    // Check if the specified level exist.
    if (!level || !(level in logger.levels)) {
      // If the level is does not exist, display a list of available levels.
      const availableLevels = Object.keys(logger.levels).map(lvl => `- ${lvl}`).join('\n');
      message.reply(`Please specify a valid level.\n${availableLevels}`);

      return;
    }

    // Get the current state of the logging level.
    const currentState = logger.isLevelEnabled(level);

    // Toggle the logging level.
    logger.setLevelEnabled(level, !currentState);

    // Send a message confirming the new level.
    message.reply(`${level} logging is now ${!currentState ? 'enabled' : 'disabled'}.`);
  },
};

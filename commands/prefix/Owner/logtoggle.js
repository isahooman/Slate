const logger = require('../../../components/logger.js');

module.exports = {
  name: 'logtoggle',
  usage: 'log <level>',
  aliases: ['ltoggle', 'togglelog'],
  category: 'Owner',
  description: 'Toggles logging for the specified level',
  execute(message, args) {
    const level = args[0]?.toUpperCase();

    // Check if the level exist
    if (!level || !(level in logger.levels)) {
      const availableLevels = Object.keys(logger.levels).map(lvl => `- ${lvl}`).join('\n');
      message.reply(`Please specify a valid level.\n${availableLevels}`);

      return;
    }

    const currentState = logger.isLevelEnabled(level);
    logger.setLevelEnabled(level, !currentState);
    message.reply(`${level} logging is now ${!currentState ? 'enabled' : 'disabled'}.`);
  },
};

const logger = require('../components/logger.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.start(`Logged in as ${client.user.tag}!`);
    logger.debug('Bot is ready and online.');
  },
};

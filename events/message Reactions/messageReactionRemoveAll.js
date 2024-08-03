const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'messageReactionRemoveAll',
  execute(message) {
    logger.info(`All reactions removed;
      Message ID: ${message.id},
      Channel: ${message.channel.name} | ${message.channel.id},
      Removed At: ${new Date().toISOString()}
    `);
  },
};

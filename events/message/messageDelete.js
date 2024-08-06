const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'messageDelete',
  execute(message) {
    logger.info(`Message deleted;
      Author: ${message.author.tag} | ${message.author.id},
      Content: ${message.content},
      Channel: ${message.channel.name} | ${message.channel.id},
      Deleted At: ${new Date().toISOString()}
    `);
  },
};

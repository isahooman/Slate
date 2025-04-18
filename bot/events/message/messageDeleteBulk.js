const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'messageDeleteBulk',
  execute(messages) {
    logger.info(`Bulk messages deleted;
      Number of Messages: ${messages.size},
      Channel: ${messages.first().channel.name} | ${messages.first().channel.id},
      Deleted At: ${new Date().toISOString()}
    `);
  },
};

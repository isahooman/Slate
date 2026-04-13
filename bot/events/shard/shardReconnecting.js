const logger = require('#components/util/logger.js');

module.exports = {
  name: 'shardReconnecting',
  execute(shardId) {
    logger.info(`Shard ${shardId} is attempting to reconnect.`);
  },
};

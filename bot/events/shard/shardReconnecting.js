const logger = require('#components/util/logger.js');

module.exports = {
  name: 'shardReconnecting',
  execute(id) {
    logger.info(`Shard ${id} is attempting to reconnect.`);
  },
};

const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'shardDisconnect',
  execute(event, id) {
    logger.info(`Shard ${id} disconnected with code: ${event.code}`);
  },
};

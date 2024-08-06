const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'shardDisconnect',
  execute(event, id) {
    logger.info(`Shard ${id} disconnected with code: ${event.code}`);
  },
};

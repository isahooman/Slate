const logger = require('#components/util/logger.js');

module.exports = {
  name: 'shardDisconnect',
  execute(closeEvent, shardId) {
    logger.info(`Shard ${shardId} disconnected with code: ${closeEvent.code}`);
  },
};

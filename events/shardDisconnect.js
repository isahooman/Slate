const { logger } = require('../components/utils.js');

module.exports = {
  name: 'shardDisconnect',
  execute(event, id) {
    logger.info(`Shard ${id} disconnected with code: ${event.code}`); // TODO: replace reason, `event.reason` depricated
  },
};

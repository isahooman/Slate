const { logger } = require('../components/utils.js');

module.exports = {
  name: 'shardReconnnecting',
  execute(id) {
    logger.info(`Shard ${id} is attempting to reconnect.`);
  },
};

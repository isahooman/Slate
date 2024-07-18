const { logger } = require('../components/loader.js');

module.exports = {
  name: 'shardReconnnecting',
  execute(id) {
    logger.info(`Shard ${id} is attempting to reconnect.`);
  },
};

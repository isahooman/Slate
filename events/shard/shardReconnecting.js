const logger = require('../../components/logger.js');

module.exports = {
  name: 'shardReconnnecting',
  execute(id) {
    logger.info(`Shard ${id} is attempting to reconnect.`);
  },
};

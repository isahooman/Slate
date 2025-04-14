const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'shardError',
  execute(error, shardId) {
    logger.error(`Error on shard ${shardId};
      Message: ${error.message},
      Stack Trace: ${error.stack || 'N/A'}
    `);
  },
};

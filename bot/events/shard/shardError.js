const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'shardError',
  execute(error, shardId) {
    // Ignore network errors
    if (error.message && error.message.includes('getaddrinfo ENOTFOUND')) return;

    // Log other shard errors
    logger.error(`Error on shard ${shardId};
      Message: ${error.message},
      Stack Trace: ${error.stack || 'N/A'}
    `);
  },
};

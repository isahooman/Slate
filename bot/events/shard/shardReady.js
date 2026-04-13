const logger = require('#components/util/logger.js');

module.exports = {
  name: 'shardReady',
  execute(shardId, unavailableGuilds = false) {
    logger.info(`Shard ${shardId} is ready!`);
    if (unavailableGuilds) logger.info(`Unavailable guilds: ${unavailableGuilds}`);
  },
};

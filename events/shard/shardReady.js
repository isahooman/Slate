const logger = require('../../components/logger.js');

module.exports = {
  name: 'shardReady',
  execute(id, unavailableGuilds = false) {
    logger.info(`Shard ${id} is ready!`);
    if (unavailableGuilds) logger.info(`Unavailable guilds: ${unavailableGuilds}`);
  },
};

const { logger } = require('../components/loader.js');

module.exports = {
  name: 'shardResume',
  execute(id, replayedEvents) {
    logger.start(`Shard ${id} has successfully reconnected. Replaying ${replayedEvents} events.`);
  },
};

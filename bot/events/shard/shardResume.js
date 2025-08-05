const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'shardResume',
  execute(id, replayedEvents) {
    logger.start(`Shard ${id} has successfully reconnected. Replaying ${replayedEvents} events.`);
  },
};

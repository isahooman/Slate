const logger = require('#components/util/logger.js');

module.exports = {
  name: 'shardResume',
  execute(shardId, replayedEvents) {
    logger.start(`Shard ${shardId} has successfully reconnected. Replaying ${replayedEvents} events.`);
  },
};

const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'channelPinsUpdate',
  execute(channel, time) {
    logger.info(`Channel pins updated;
      Channel: ${channel.name} | ${channel.id},
      Last Pins Update: ${time.toISOString()},
    `);
  },
};

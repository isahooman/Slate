const logger = require('../components/logger.js');

module.exports = {
  name: 'channelPinsUpdate',
  execute(channel, time) {
    logger.info(`Channel pins updated;
      Channel Name: ${channel.name},
      Channel ID: ${channel.id},
      Last Pins Update: ${time.toISOString()},
    `);
  },
};

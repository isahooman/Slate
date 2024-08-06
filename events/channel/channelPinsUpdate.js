const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'channelPinsUpdate',
  execute(channel, time) {
    logger.info(`Channel pins updated;
      Channel: ${channel.name} | ${channel.id},
      Last Pins Update: ${time.toISOString()},
    `);
  },
};

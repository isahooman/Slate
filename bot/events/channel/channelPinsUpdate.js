const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'channelPinsUpdate',
  execute(channel, time) {
    const readableTime = time ? new Date(time).toLocaleString() : 'Not available';

    logger.info(`Channel pins updated;
      Channel: ${channel.name} | ${channel.id},
      Last Pins Update: ${readableTime},
    `);
  },
};

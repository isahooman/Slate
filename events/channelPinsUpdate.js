const logger = require('../components/logger.js');

module.exports = {
  name: 'channelPinsUpdate',
  execute(channel) {
    logger.info(`Pins updated in channel: (${channel.name} | ${channel.id}) in server: (${channel.guild.name} | ${channel.guildId})`);
  },
};

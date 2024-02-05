const logger = require('../components/logger.js');

module.exports = {
  name: 'channelDelete',
  execute(channel) {
    logger.info(`Channel deleted: (${channel.name} | ${channel.id}) from server: (${channel.guild.name} | ${channel.guildId})`);
  },
};

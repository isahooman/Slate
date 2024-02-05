const logger = require('../components/logger.js');

module.exports = {
  name: 'channelCreate',
  execute(channel) {
    logger.info(`Channel created: (${channel.name} | ${channel.id}) in server: (${channel.guild.name} | ${channel.guildId})`);
  },
};

const { logger } = require('../../components/loggerUtil.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'channelCreate',
  execute(channel) {
    logger.info(`Channel created;
      Name: ${channel.name},
      ID: ${channel.id},
      Type: ${channel.type},
      Guild ID: ${channel.guild ? channel.guild.id : 'N/A'},
    `);

    // Update the channel cache
    cache.updateChannel(channel);
  },
};

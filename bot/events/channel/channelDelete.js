const logger = require('../../components/util/logger.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'channelDelete',
  execute(channel) {
    logger.info(`Channel deleted;
      Name: ${channel.name},
      ID: ${channel.id},
      Type: ${channel.type},
      Guild ID: ${channel.guild ? channel.guild.id : 'N/A'},
    `);

    // Remove the channel from the cache
    cache.removeChannel(channel.id);
  },
};

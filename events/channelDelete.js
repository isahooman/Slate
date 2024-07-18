const { logger } = require('../components/loggerUtil.js');

module.exports = {
  name: 'channelDelete',
  execute(channel) {
    logger.info(`Channel deleted;
      Name: ${channel.name},
      ID: ${channel.id},
      Type: ${channel.type},
      Guild ID: ${channel.guild ? channel.guild.id : 'N/A'},
    `);
  },
};

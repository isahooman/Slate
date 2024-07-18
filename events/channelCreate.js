const { logger } = require('../components/loader.js');

module.exports = {
  name: 'channelCreate',
  execute(channel) {
    logger.info(`Channel created;
      Name: ${channel.name},
      ID: ${channel.id},
      Type: ${channel.type},
      Guild ID: ${channel.guild ? channel.guild.id : 'N/A'},
    `);
  },
};

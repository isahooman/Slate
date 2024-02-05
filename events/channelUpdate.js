const logger = require('../components/logger.js');

module.exports = {
  name: 'channelUpdate',
  execute(oldChannel, newChannel) {
    logger.info(`Channel updated;
      Old Name: ${oldChannel.name},
      New Name: ${newChannel.name},
      Old Type: ${oldChannel.type},
      New Type: ${newChannel.type},
      ID: ${newChannel.id},
      Guild ID: ${newChannel.guild ? newChannel.guild.id : 'N/A'},
    `);
  },
};

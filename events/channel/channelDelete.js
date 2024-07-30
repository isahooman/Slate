const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'channelDelete',
  execute(channel, client) {
    logger.info(`Channel deleted;
      Name: ${channel.name},
      ID: ${channel.id},
      Type: ${channel.type},
      Guild ID: ${channel.guild ? channel.guild.id : 'N/A'},
    `);

    // Update channel cache
    if (channel.type === 'GUILD_TEXT') {
      logger.debug(`Removing text channel from cache: ${channel.name} (${channel.id})`);
      client.textChannels.delete(channel.id);
    } else if (channel.type === 'GUILD_VOICE') {
      logger.debug(`Removing voice channel from cache: ${channel.name} (${channel.id})`);
      client.voiceChannels.delete(channel.id);
    }
  },
};

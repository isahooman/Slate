const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'channelCreate',
  execute(channel, client) {
    logger.info(`Channel created;
      Name: ${channel.name},
      ID: ${channel.id},
      Type: ${channel.type},
      Guild ID: ${channel.guild ? channel.guild.id : 'N/A'},
    `);

    // Update channel cache
    if (channel.type === 'GUILD_TEXT') {
      client.textChannels.set(channel.id, channel);
      logger.debug(`Adding text channel to cache: ${channel.name} (${channel.id})`);
    } else if (channel.type === 'GUILD_VOICE') {
      client.voiceChannels.set(channel.id, channel);
      logger.debug(`Adding voice channel to cache: ${channel.name} (${channel.id})`);
    }
  },
};

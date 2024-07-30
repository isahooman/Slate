const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildUnavailable',
  execute(guild, client) {
    logger.info(`Guild became unavailable;
      Guild Name: ${guild.name} | ${guild.id},
      Unavailable At: ${new Date().toISOString()},
    `);

    // Update guild cache
    client.guilds.set(guild.id, guild);
    logger.debug(`Updating guild cache for guild: ${guild.name} (${guild.id})`);
  },
};

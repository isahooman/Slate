const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildAvailable',
  execute(guild, client) {
    logger.info(`Guild Available;
      Name: ${guild.name} | ${guild.id},
    `);

    // Update guild cache
    client.guilds.cache.set(guild.id, guild);
    logger.debug(`Adding guild to cache: ${guild.name} (${guild.id})`);
  },
};

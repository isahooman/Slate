const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildDelete',
  execute(guild, client) {
    logger.info(`Bot removed from a guild;
      Guild Name: ${guild.name} | ${guild.id},
      Owner: ${guild.owner.user.tag} | ${guild.owner.user.id},
      Removed At: ${new Date().toISOString()},
    `);

    // Update guild cache
    client.guilds.delete(guild.id);
    logger.debug(`Removing guild from cache: ${guild.name} (${guild.id})`);
  },
};

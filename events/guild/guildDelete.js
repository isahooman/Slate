const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildDelete',
  execute(guild) {
    logger.info(`Bot removed from a guild;
      Guild Name: ${guild.name} | ${guild.id},
      Owner: ${guild.owner.user.tag} | ${guild.owner.user.id},
      Removed At: ${new Date().toISOString()},
    `);
  },
};

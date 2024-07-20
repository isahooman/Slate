const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildBanRemove',
  execute(guild, user) {
    logger.info(`User's ban removed from guild;
      User: ${user.tag} | ${user.id},
      Guild: ${guild.name} | ${guild.id},
      Unbanned At: ${new Date().toISOString()}
    `);
  },
};

const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildBanAdd',
  execute(guild, user) {
    logger.info(`User banned from guild;
      User: ${user.tag} | ${user.id},
      Guild: ${guild.name} | ${guild.id},
      Banned At: ${new Date().toISOString()}
    `);
  },
};

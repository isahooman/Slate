const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildScheduledEventUserAdd',
  execute(event, user) {
    logger.info(`User Added to Guild Scheduled Event;
      Server: ${event.guild.name} | ${event.guildId}
      Event: ${event.name} | ${event.id},
      User: ${user.tag} | ${user.id},
    `);
  },
};

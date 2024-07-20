const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildScheduledEventUserRemove',
  execute(event, user) {
    logger.info(`User Removed from Guild Scheduled Event;
      Server: ${event.guild.name} | ${event.guildId}
      Event: ${event.name} | ${event.id},
      User: ${user.tag} | ${user.id},
    `);
  },
};

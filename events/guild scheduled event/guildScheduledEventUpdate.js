const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildScheduledEventUpdate',
  execute(oldEvent, newEvent) {
    logger.info(`Guild Scheduled Event Updated;
      Server: ${oldEvent.guild.name} | ${oldEvent.guildId}
      Event: ${newEvent.name} | ${newEvent.id},
      Old Start Time: ${oldEvent.scheduledStartTimestamp},
      New Start Time: ${newEvent.scheduledStartTimestamp},
      Old End Time: ${oldEvent.scheduledEndTimestamp || 'N/A'},
      New End Time: ${newEvent.scheduledEndTimestamp || 'N/A'}
    `);
  },
};

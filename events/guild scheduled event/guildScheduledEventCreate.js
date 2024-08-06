const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildScheduledEventCreate',
  execute(event) {
    logger.info(`Guild Scheduled Event Created;
      Server: ${event.guild.name} | ${event.guildId}
      Name: ${event.name} | ${event.id},
      Start Time: ${event.scheduledStartTimestamp},
      End Time: ${event.scheduledEndTimestamp || 'N/A'},
      Description: ${event.description || 'N/A'},
      Creator: ${event.creator ? event.creator.tag : 'N/A'}
    `);
  },
};

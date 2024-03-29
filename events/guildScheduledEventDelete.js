const logger = require('../components/logger.js');

module.exports = {
  name: 'guildScheduledEventDelete',
  execute(event) {
    logger.info(`Guild Scheduled Event Deleted;
      Server: ${event.guild.name} | ${event.guildId}
      Event: ${event.name} | ${event.id},
    `);
  },
};

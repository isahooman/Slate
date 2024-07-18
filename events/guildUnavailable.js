const { logger } = require('../components/loader.js');

module.exports = {
  name: 'guildUnavailable',
  execute(guild) {
    logger.info(`Guild became unavailable;
      Guild Name: ${guild.name} | ${guild.id},
      Unavailable At: ${new Date().toISOString()},
    `);
  },
};

const { logger } = require('../components/loader.js');

module.exports = {
  name: 'guildAvailable',
  execute(guild) {
    logger.info(`Guild Available;
      Name: ${guild.name} | ${guild.id},
    `);
  },
};

const logger = require('../../components/util/logger.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'guildAvailable',
  execute(guild) {
    logger.info(`Guild Available;
      Name: ${guild.name} | ${guild.id},
    `);

    // Update the guild cache
    cache.updateGuild(guild);
  },
};

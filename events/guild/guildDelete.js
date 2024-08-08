const { logger } = require('../../components/loggerUtil.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'guildDelete',
  execute(guild) {
    logger.info(`Bot removed from a guild;
      Guild Name: ${guild.name} | ${guild.id},
      Owner: ${guild.owner.user.tag} | ${guild.owner.user.id},
      Removed At: ${new Date().toISOString()},
    `);

    // Remove the guild from the cache
    cache.removeGuild(guild.id);

    // Remove members from cache
    cache.members.forEach((member, memberId) => {
      if (member.guild.id === guild.id) cache.removeMember(memberId);
    });
  },
};

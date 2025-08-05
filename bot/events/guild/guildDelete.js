const logger = require('../../components/util/logger.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'guildDelete',
  execute(guild) {
    // Retrieve cached information for the guild
    const cachedGuild = cache.getGuild(guild.id);
    const owner = cachedGuild ? cache.getMember(cachedGuild.ownerId) : null;

    logger.info(`Bot removed from a cached guild;
      Guild Name: ${cachedGuild ? cachedGuild.name : guild.name} | ${guild.id},
      Owner: ${owner ? `${owner.user.tag} | ${owner.id}` : 'Owner not cached'},
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

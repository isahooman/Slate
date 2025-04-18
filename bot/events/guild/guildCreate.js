const logger = require('../../components/util/logger.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    try {
      // Fetch the guild owner
      const owner = await guild.fetchOwner();

      logger.info(`Bot joined a new server;
        Server: ${guild.name} | ${guild.id},
        Members: ${guild.memberCount},
        Owner: ${owner.user.tag} | ${owner.user.id},
        Created At: ${guild.createdAt.toISOString()},
        Region: ${guild.region},
        Verification Level: ${guild.verificationLevel},
        Features: ${guild.features.join(', ') || 'N/A'},
        Large Guild: ${guild.large ? 'Yes' : 'No'},
        Bot Count: ${guild.members.cache.filter(member => member.user.bot).size}
      `);

      // Add the guild to the guild cache
      cache.updateGuild(guild);

      // Cache all members of the new guild
      cache.cacheMembers(guild);
    } catch (error) {
      logger.error(`Error in guildCreate event: ${error}`);
    }
  },
};

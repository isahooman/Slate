const logger = require('../components/logger.js');

module.exports = {
  name: 'guildCreate',
  execute(guild) {
    logger.info(`Bot joined a new server;
      Server: ${guild.name} | ${guild.id},
      Members: ${guild.memberCount},
      Owner: ${guild.owner.user.tag} | ${guild.owner.user.id},
      Created At: ${guild.createdAt.toISOString()},
      Region: ${guild.region},
      Verification Level: ${guild.verificationLevel},
      Features: ${guild.features.join(', ') || 'N/A'},
      Large Guild: ${guild.large ? 'Yes' : 'No'},
      Bot Count: ${guild.members.cache.filter(member => member.user.bot).size}
    `);
  },
};

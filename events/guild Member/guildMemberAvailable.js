const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildMemberAvailable',
  execute(member, client) {
    logger.info(`Member became available in the guild;
      Member: ${member.user.tag} | ${member.user.id},
      Guild: ${member.guild.name} | ${member.guild.id},
      Available At: ${new Date().toISOString()}
    `);

    // Update user cache
    client.users.set(member.user.id, member.user);
    logger.debug(`Adding user to cache: ${member.user.tag} (${member.user.id})`);
  },
};

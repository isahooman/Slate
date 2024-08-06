const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildMemberAdd',
  execute(member, client) {
    logger.info(`Member joined the guild;
      Member: ${member.user.tag} | ${member.user.id},
      Guild: ${member.guild.name} | ${member.guild.id},
      Joined At: ${member.joinedAt.toISOString()}
    `);

    // Update user cache
    client.users.set(member.user.id, member.user);
    logger.debug(`Adding user to cache: ${member.user.tag} (${member.user.id})`);
  },
};

const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildMemberRemove',
  execute(member, client) {
    logger.info(`Member left or was removed from the guild;
      Member: ${member.user.tag} (${member.user.id}),
      Guild: ${member.guild.name} | ${member.guild.id},
      Left At: ${new Date().toISOString()}
    `);

    // Update user cache
    client.users.delete(member.user.id);
    logger.debug(`Removing user from cache: ${member.user.tag} (${member.user.id})`);
  },
};

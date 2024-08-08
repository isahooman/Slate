const { logger } = require('../../components/loggerUtil.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'guildMemberAdd',
  execute(member) {
    logger.info(`Member joined the guild;
      Member: ${member.user.tag} | ${member.user.id},
      Guild: ${member.guild.name} | ${member.guild.id},
      Joined At: ${member.joinedAt.toISOString()}
    `);

    // Update member cache
    cache.updateMember(member);
  },
};

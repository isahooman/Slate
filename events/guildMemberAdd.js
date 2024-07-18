const { logger } = require('../components/utils.js');

module.exports = {
  name: 'guildMemberAdd',
  execute(member) {
    logger.info(`Member joined the guild;
      Member: ${member.user.tag} | ${member.user.id},
      Guild: ${member.guild.name} | ${member.guild.id},
      Joined At: ${member.joinedAt.toISOString()}
    `);
  },
};

const { logger } = require('../../components/loggerUtil.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'guildMemberRemove',
  execute(member) {
    logger.info(`Member left or was removed from the guild;
      Member: ${member.user.tag} (${member.user.id}),
      Guild: ${member.guild.name} | ${member.guild.id},
      Left At: ${new Date().toISOString()}
    `);

    // Remove the member from the cache
    cache.removeMember(member.id);
  },
};

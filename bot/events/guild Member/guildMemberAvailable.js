const logger = require('../../components/util/logger.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'guildMemberAvailable',
  execute(member) {
    logger.info(`Member became available in the guild;
      Member: ${member.user.tag} | ${member.user.id},
      Guild: ${member.guild.name} | ${member.guild.id},
      Available At: ${new Date().toISOString()}
    `);

    // Update member cache
    cache.updateMember(member);
  },
};

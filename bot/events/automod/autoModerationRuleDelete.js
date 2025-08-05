const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'autoModerationRuleDelete',
  execute(rule) {
    logger.info(`Auto Moderation Rule Deleted;
      Server: ${rule.guild.name} | ${rule.guildId},
      Rule: ${rule.name} | ${rule.id},
    `);
  },
};

const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'autoModerationRuleUpdate',
  execute(oldRule, newRule) {
    logger.info(`Auto Moderation Rule Updated;
      Server: ${newRule.guild.name} | ${newRule.guildId}
      Rule ID: ${newRule.id},
      Old Rule Name: ${oldRule.name},
      New Rule Name: ${newRule.name},
    `);
  },
};

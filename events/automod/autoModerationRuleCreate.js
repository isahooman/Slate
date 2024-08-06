const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'autoModerationRuleCreate',
  execute(rule) {
    logger.info(`Auto Moderation Rule Created;
      Server: ${rule.guild.name} | ${rule.guildId}
      Rule: ${rule.name} | ${rule.id},
    `);
  },
};

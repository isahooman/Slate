const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'autoModerationActionExecution',
  execute(action) {
    logger.info(`Auto Moderation Action Executed;
      Server: ${action.guild.name} | ${action.guildId},
      Rule Name: ${action.ruleName},
      Rule Trigger Type: ${action.ruleTriggerType},
      User: ${action.user.tag} | ${action.user.id},
      Action: ${action.actionType},
      Content: ${action.content || 'N/A'},
    `);
  },
};

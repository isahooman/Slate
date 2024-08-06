const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildAuditLogEntryCreate',
  execute(entry) {
    logger.info(`Guild Audit Log Entry Created;
      Server: ${entry.guild.name} | ${entry.guildId}
      Target: ${entry.targetType} | ${entry.targetId},
      Executor: ${entry.executor.tag} | ${entry.executor.id},
      Type: ${entry.actionType},
      Reason: ${entry.reason || 'N/A'},
    `);
  },
};

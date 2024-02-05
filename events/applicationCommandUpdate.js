const logger = require('../components/logger.js');

module.exports = {
  name: 'applicationCommandUpdate',
  execute(oldCommand, newCommand) {
    logger.info(`Application command updated;
      Old Name: ${oldCommand.name},
      New Name: ${newCommand.name},
      Type: ${newCommand.type},
      ID: ${newCommand.id},
      Application ID: ${newCommand.applicationId},
      Guild ID: ${newCommand.guildId || 'Global Command'},
    `);
  },
};

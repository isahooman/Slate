const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'applicationCommandDelete',
  execute(command) {
    logger.info(`Application command deleted;
      Name: ${command.name},
      Type: ${command.type},
      ID: ${command.id},
      Application ID: ${command.applicationId},
      Guild ID: ${command.guildId || 'Global Command'},
    `);
  },
};

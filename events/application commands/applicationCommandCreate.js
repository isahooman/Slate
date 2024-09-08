const logger = require('../../components/logger.js');

module.exports = {
  name: 'applicationCommandCreate',
  execute(command) {
    logger.info(`New application command created;
      Name: ${command.name},
      Type: ${command.type},
      ID: ${command.id},
      Application ID: ${command.applicationId},
      Guild ID: ${command.guildId || 'Global Command'},
    `);
  },
};

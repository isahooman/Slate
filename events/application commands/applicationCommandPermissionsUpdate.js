const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'applicationCommandPermissionsUpdate',
  execute(data) {
    logger.info(`Application Command Permissions Updated;
      Server: ${data.guild.name} | ${data.guildId},
      Command: ${data.commandId},
    `);
  },
};

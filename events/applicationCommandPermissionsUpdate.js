const { logger } = require('../components/utils.js');

module.exports = {
  name: 'applicationCommandPermissionsUpdate',
  execute(data) {
    logger.info(`Application Command Permissions Updated;
      Server: ${data.guild.name} | ${data.guildId},
      Command: ${data.commandId},
    `);
  },
};

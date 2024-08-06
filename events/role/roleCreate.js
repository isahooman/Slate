const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'roleCreate',
  execute(role) {
    logger.info(`Role created;
      Name: ${role.name},
      ID: ${role.id},
      Guild: ${role.guild.name} | ${role.guild.id},
      Created At: ${new Date().toISOString()}
    `);
  },
};

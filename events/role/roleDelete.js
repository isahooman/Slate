const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'roleDelete',
  execute(role) {
    logger.info(`Role deleted;
      Name: ${role.name},
      ID: ${role.id},
      Guild: ${role.guild.name} | ${role.guild.id},
      Deleted At: ${new Date().toISOString()}
    `);
  },
};

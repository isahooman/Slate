const logger = require('../components/logger.js');

module.exports = {
  name: 'roleUpdate',
  execute(oldRole, newRole) {
    logger.info(`Role updated;
      Old Name: ${oldRole.name},
      New Name: ${newRole.name},
      ID: ${newRole.id},
      Guild: ${newRole.guild.name} | ${newRole.guild.id},
      Updated At: ${new Date().toISOString()}
    `);
  },
};

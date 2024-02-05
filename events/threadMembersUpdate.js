const logger = require('../components/logger.js');

module.exports = {
  name: 'threadMembersUpdate',
  execute(oldMembers, newMembers, thread) {
    logger.info(`Thread members updated;
      Thread Name: ${thread.name} | ${thread.id},
      Guild: ${thread.guild.name} | ${thread.guild.id},
      Updated At: ${new Date().toISOString()},
      Old Member Count: ${oldMembers.size},
      New Member Count: ${newMembers.size}
    `);
  },
};

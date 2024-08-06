const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'threadMembersUpdate',
  execute(oldMembers, newMembers, thread) {
    const logDetails = [];

    // Check name and ID
    logDetails.push(`Thread Name: ${thread.name} | ${thread.id}`);

    // Check member count
    if (oldMembers.size !== newMembers.size) logDetails.push(`Member Count: ${oldMembers.size} -> ${newMembers.size}`);

    // Log changed information
    if (logDetails.length > 0) logger.info(`Thread members updated;
        Guild: ${thread.guild.name} | ${thread.guild.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);
  },
};

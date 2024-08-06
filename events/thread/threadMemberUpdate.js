const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'threadMemberUpdate',
  execute(oldMember, newMember) {
    const logDetails = [];

    // Check username
    if (oldMember.user.username !== newMember.user.username) logDetails.push(`Username: ${oldMember.user.username} -> ${newMember.user.username}`);

    // Check nickname
    if (oldMember.nickname !== newMember.nickname) logDetails.push(`Nickname: ${oldMember.nickname || 'None'} -> ${newMember.nickname || 'None'}`);

    // Check roles
    if (oldMember.roles.cache !== newMember.roles.cache) {
      const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
      const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

      if (addedRoles.size > 0) logDetails.push(`Added Roles: ${addedRoles.map(role => role.name).join(', ')}`);
      if (removedRoles.size > 0) logDetails.push(`Removed Roles: ${removedRoles.map(role => role.name).join(', ')}`);
    }

    // Log changed information
    if (logDetails.length > 0) logger.info(`Thread member details updated;
        Member: ${newMember.user.tag} | ${newMember.user.id},
        Thread Name: ${newMember.thread.name} | ${newMember.thread.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);
  },
};

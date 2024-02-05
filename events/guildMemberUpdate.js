const logger = require('../components/logger.js');

module.exports = {
  name: 'guildMemberUpdate',
  execute(oldMember, newMember) {
    const logDetails = [];

    // Check and log username change
    if (oldMember.user.username !== newMember.user.username) logDetails.push(`Username: ${oldMember.user.username} -> ${newMember.user.username}`);

    // Check and log nickname change
    if (oldMember.nickname !== newMember.nickname) logDetails.push(`Nickname: ${oldMember.nickname || 'None'} -> ${newMember.nickname || 'None'}`);

    // Check and log roles change
    if (oldMember.roles.cache !== newMember.roles.cache) {
      const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
      const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
      if (addedRoles.size > 0) logDetails.push(`Added Roles: ${addedRoles.map(role => role.name).join(', ')}`);
      if (removedRoles.size > 0) logDetails.push(`Removed Roles: ${removedRoles.map(role => role.name).join(', ')}`);
    }

    // Log information when any change is detected
    if (logDetails.length > 0) logger.info(`Member details updated;
        Member: ${newMember.user.tag} (${newMember.user.id}),
        Guild: ${newMember.guild.name} | ${newMember.guild.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);
  },
};
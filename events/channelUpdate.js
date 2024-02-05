const logger = require('../components/logger.js');

module.exports = {
  name: 'channelUpdate',
  execute(oldChannel, newChannel) {
    let changes = [];
    // check for name changes
    if (oldChannel.name !== newChannel.name) changes.push(`name: from "${oldChannel.name}" to "${newChannel.name}"`);

    // check for topic changes
    if (oldChannel.topic !== newChannel.topic) changes.push(`topic: from "${oldChannel.topic}" to "${newChannel.topic}"`);

    // Check for permission changes
    const oldPerms = oldChannel.permissionOverwrites.cache.map(perm => `${perm.id}:${perm.allow}:${perm.deny}`);
    const newPerms = newChannel.permissionOverwrites.cache.map(perm => `${perm.id}:${perm.allow}:${perm.deny}`);
    const permissionsChanged = oldPerms.length !== newPerms.length || !oldPerms.every(value => newPerms.includes(value));
    if (permissionsChanged) changes.push('permissions changed');

    // Log changes if any were detected
    if (changes.length > 0) logger.info(`Channel updated: ${oldChannel.name} (ID: ${oldChannel.id}) in guild: ${oldChannel.guildId}. Changes: ${changes.join(', ')}`);
  },
};

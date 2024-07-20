const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'emojiUpdate',
  execute(oldEmoji, newEmoji) {
    const logDetails = [];

    // Check emoji name
    if (oldEmoji.name !== newEmoji.name) logDetails.push(`Name: ${oldEmoji.name} -> ${newEmoji.name}`);

    // Check emoji roles
    if (oldEmoji.roles.cache !== newEmoji.roles.cache) {
      const addedRoles = newEmoji.roles.cache.filter(role => !oldEmoji.roles.cache.has(role.id));
      const removedRoles = oldEmoji.roles.cache.filter(role => !newEmoji.roles.cache.has(role.id));

      if (addedRoles.size > 0) logDetails.push(`Added Roles: ${addedRoles.map(role => role.name).join(', ')}`);
      if (removedRoles.size > 0) logDetails.push(`Removed Roles: ${removedRoles.map(role => role.name).join(', ')}`);
    }

    // Check emoji image
    if (oldEmoji.url !== newEmoji.url) logDetails.push(`Image Changed`);

    // Log changed information
    if (logDetails.length > 0) logger.info(`Emoji updated;
        Emoji Name: ${newEmoji.name} | ${newEmoji.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);
  },
};

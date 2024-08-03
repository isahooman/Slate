const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'userUpdate',
  execute(oldUser, newUser) {
    // Update the user cache
    newUser.client.users.cache.set(newUser.id, newUser);

    if (oldUser.avatarURL() !== newUser.avatarURL()) logger.info(
      `User updated;
        Old Tag: ${oldUser.tag} | ${oldUser.id},
        New Tag: ${newUser.tag} | ${newUser.id},
        Old Avatar: ${oldUser.avatarURL() || 'N/A'},
        New Avatar: ${newUser.avatarURL() || 'N/A'},
        Updated At: ${new Date().toISOString()}
      `);
    else logger.info(`
      User updated;
        Old Tag: ${oldUser.tag} | ${oldUser.id},
        New Tag: ${newUser.tag} | ${newUser.id},
        Updated At: ${new Date().toISOString()}
      `);
  },
};

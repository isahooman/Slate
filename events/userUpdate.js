const logger = require('../components/logger.js');

module.exports = {
  name: 'userUpdate',
  execute(oldUser, newUser) {
    if (oldUser.avatarURL() !== newUser.avatarURL()) {
      logger.info(`User updated (including avatar change);
        Old Tag: ${oldUser.tag} | ${oldUser.id},
        New Tag: ${newUser.tag} | ${newUser.id},
        Old Avatar: ${oldUser.avatarURL() || 'N/A'},
        New Avatar: ${newUser.avatarURL() || 'N/A'},
        Updated At: ${new Date().toISOString()}
      `);
    } else {
      logger.info(`User updated (no avatar change);
        Old Tag: ${oldUser.tag} | ${oldUser.id},
        New Tag: ${newUser.tag} | ${newUser.id},
        Updated At: ${new Date().toISOString()}
      `);
    }
  },
};

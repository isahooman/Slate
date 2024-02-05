const logger = require('../components/logger.js');

module.exports = {
  name: 'emojiUpdate',
  execute(oldEmoji, newEmoji) {
    logger.info(`Emoji updated;
      Old Name: ${oldEmoji.name},
      New Name: ${newEmoji.name},
      ID: ${newEmoji.id},
      Guild: ${newEmoji.guild.name} | ${newEmoji.guild.id},
      Updated At: ${new Date().toISOString()}
    `);
  },
};

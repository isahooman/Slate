const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'emojiDelete',
  execute(emoji) {
    logger.info(`Emoji deleted;
      Name: ${emoji.name},
      ID: ${emoji.id},
      Guild: ${emoji.guild.name} | ${emoji.guild.id},
      Deleted At: ${new Date().toISOString()},
    `);
  },
};

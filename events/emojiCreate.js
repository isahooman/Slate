const { logger } = require('../components/loader.js');

module.exports = {
  name: 'emojiCreate',
  execute(emoji) {
    logger.info(`Emoji created;
      Name: ${emoji.name},
      ID: ${emoji.id},
      Guild: ${emoji.guild.name} | ${emoji.guild.id},
      Created At: ${emoji.createdAt.toISOString()}
    `);
  },
};

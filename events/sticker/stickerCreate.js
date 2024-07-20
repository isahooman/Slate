const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'stickerCreate',
  execute(sticker) {
    logger.info(`Sticker created;
      Name: ${sticker.name},
      ID: ${sticker.id},
      Guild: ${sticker.guild.name} | ${sticker.guild.id},
      Created At: ${sticker.createdAt.toISOString()}
    `);
  },
};

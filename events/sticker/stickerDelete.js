const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'stickerDelete',
  execute(sticker) {
    logger.info(`Sticker deleted;
      Name: ${sticker.name},
      ID: ${sticker.id},
      Guild: ${sticker.guild.name} | ${sticker.guild.id},
      Deleted At: ${new Date().toISOString()}
    `);
  },
};

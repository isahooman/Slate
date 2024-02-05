const logger = require('../components/logger.js');

module.exports = {
  name: 'stickerUpdate',
  execute(oldSticker, newSticker) {
    logger.info(`Sticker updated;
      Old Name: ${oldSticker.name},
      New Name: ${newSticker.name},
      ID: ${newSticker.id},
      Guild: ${newSticker.guild.name} | ${newSticker.guild.id},
      Updated At: ${new Date().toISOString()},
    `);
  },
};

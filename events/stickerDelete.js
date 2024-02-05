const logger = require('../components/logger.js');

module.exports = {
  name: 'stickerDelete',
  execute(sticker) {
    logger.info(`Sticker deleted: ${sticker.name} (ID: ${sticker.id}) from guild: ${sticker.guild.name}|${sticker.guildId}`);
  },
};

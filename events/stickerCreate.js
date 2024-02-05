const logger = require('../components/logger.js');

module.exports = {
  name: 'stickerCreate',
  execute(sticker) {
    logger.info(`New sticker created: ${sticker.name} (ID: ${sticker.id}) in guild: ${sticker.guild.name}|${sticker.guildId}`);
  },
};

const logger = require('../components/logger.js');

module.exports = {
  name: 'stickerUpdate',
  execute(oldSticker, newSticker) {
    let changes = [];
    if (oldSticker.name !== newSticker.name) {
      changes.push(`name: from "${oldSticker.name}" to "${newSticker.name}"`);
    }
    if (oldSticker.description !== newSticker.description) {
      changes.push(`description: from "${oldSticker.description}" to "${newSticker.description}"`);
    }
    if (oldSticker.tags !== newSticker.tags) {
      changes.push(`tags: from "${oldSticker.tags}" to "${newSticker.tags}"`);
    }
    if (changes.length > 0) {
      logger.info(`Sticker updated: ${oldSticker.name} (ID: ${oldSticker.id}) in guild: ${oldSticker.guild.name}|${oldSticker.guildId}. Changes: ${changes.join(", ")}`);
    }
  },
};

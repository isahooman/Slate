const logger = require('../components/logger.js');

module.exports = {
  name: 'stickerUpdate',
  execute(oldSticker, newSticker) {
    let changes = [];
    // check for sticker name changes
    if (oldSticker.name !== newSticker.name) changes.push(`name: from "${oldSticker.name}" to "${newSticker.name}"`);
    // check for sticker description changes
    if (oldSticker.description !== newSticker.description) changes.push(`description: from "${oldSticker.description}" to "${newSticker.description}"`);
    // check for sticker tag changes
    if (oldSticker.tags !== newSticker.tags) changes.push(`tags: from "${oldSticker.tags}" to "${newSticker.tags}"`);
    // if changes, log changes
    if (changes.length > 0) logger.info(`Sticker updated: ${oldSticker.name} (ID: ${oldSticker.id}) in guild: ${oldSticker.guild.name}|${oldSticker.guildId}. Changes: ${changes.join(', ')}`);
  },
};

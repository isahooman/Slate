const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'stickerUpdate',
  execute(oldSticker, newSticker) {
    const logDetails = [];

    // Check sticker name
    if (oldSticker.name !== newSticker.name) logDetails.push(`Name: ${oldSticker.name} -> ${newSticker.name}`);

    // Check sticker description
    if (oldSticker.description !== newSticker.description) logDetails.push(`Description: ${oldSticker.description || 'None'} -> ${newSticker.description || 'None'}`);

    // Check sticker type
    if (oldSticker.type !== newSticker.type) logDetails.push(`Type: ${oldSticker.type} -> ${newSticker.type}`);

    // Check sticker image
    if (oldSticker.url !== newSticker.url) logDetails.push(`Image (URL) Changed`);

    // Log changed information
    if (logDetails.length > 0) logger.info(`Sticker updated;
        Sticker Name: ${newSticker.name} | ${newSticker.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);
  },
};

const logger = require('../../components/util/logger.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'channelUpdate',
  execute(oldChannel, newChannel) {
    const logDetails = [];

    // Check channel name
    if (oldChannel.name !== newChannel.name) logDetails.push(`Name: ${oldChannel.name} -> ${newChannel.name}`);

    // Check channel topic
    if (oldChannel.topic !== newChannel.topic) logDetails.push(`Topic: ${oldChannel.topic || 'None'} -> ${newChannel.topic || 'None'}`);

    // Check channel type
    if (oldChannel.type !== newChannel.type) logDetails.push(`Type: ${oldChannel.type} -> ${newChannel.type}`);

    // Check channel position
    if (oldChannel.position !== newChannel.position) logDetails.push(`Position: ${oldChannel.position} -> ${newChannel.position}`);

    // Check channel parent category
    if (oldChannel.parentID !== newChannel.parentID) logDetails.push(`Parent Category: ${oldChannel.parent ? oldChannel.parent.name : 'None'} -> ${newChannel.parent ? newChannel.parent.name : 'None'}`);

    // Check channel NSFW flag
    if (oldChannel.nsfw !== newChannel.nsfw) logDetails.push(`NSFW: ${oldChannel.nsfw ? 'Yes' : 'No'} -> ${newChannel.nsfw ? 'Yes' : 'No'}`);

    // Check bitrate (only for voice channels)
    if (oldChannel.bitrate !== newChannel.bitrate && newChannel.type === 'GUILD_VOICE') logDetails.push(`Bitrate: ${oldChannel.bitrate} kbps -> ${newChannel.bitrate} kbps`);

    // Log changed information
    if (logDetails.length > 0) logger.info(`Channel updated;
        Channel: ${newChannel.name} | ${newChannel.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);

    // Update the channel cache
    cache.updateChannel(newChannel);
  },
};

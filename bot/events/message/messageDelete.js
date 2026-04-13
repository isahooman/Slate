const logger = require('#components/util/logger.js');

module.exports = {
  name: 'messageDelete',
  execute(message) {
    if (!message.author) return;
    const channelName = message.channel.isDMBased() ? 'DM' : (message.channel.name ?? message.channel.id);
    logger.info(`Message deleted;
      Author: ${message.author.tag} | ${message.author.id},
      Content: ${message.content},
      Channel: ${channelName} | ${message.channel.id},
      Deleted At: ${new Date().toISOString()}
    `);
  },
};

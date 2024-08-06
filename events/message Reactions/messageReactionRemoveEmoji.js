const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'messageReactionRemoveEmoji',
  execute(reaction) {
    logger.info(`Reaction emoji removed;
      Emoji: ${reaction.emoji.name},
      Message ID: ${reaction.message.id},
      Channel: ${reaction.message.channel.name} | ${reaction.message.channel.id},
      Removed At: ${new Date().toISOString()}
    `);
  },
};

const { logger } = require('../components/utils.js');

module.exports = {
  name: 'messageReactionRemove',
  execute(reaction, user) {
    logger.info(`Reaction removed;
      Reaction: ${reaction.emoji.name},
      Message ID: ${reaction.message.id},
      User: ${user.tag} | ${user.id},
      Channel: ${reaction.message.channel.name} | ${reaction.message.channel.id},
      Removed At: ${new Date().toISOString()}
    `);
  },
};

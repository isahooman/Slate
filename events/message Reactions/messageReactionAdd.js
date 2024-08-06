const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'messageReactionAdd',
  execute(reaction, user) {
    logger.info(`Reaction added;
      Reaction: ${reaction.emoji.name},
      Message ID: ${reaction.message.id},
      User: ${user.tag} | ${user.id},
      Channel: ${reaction.message.channel.name} | ${reaction.message.channel.id},
      Added At: ${new Date().toISOString()}
    `);
  },
};

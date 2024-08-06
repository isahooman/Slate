const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'typingStart',
  execute(channel, user) {
    logger.info(`User started typing;
      User: ${user.tag} | ${user.id},
      Channel: ${channel.name} | ${channel.id},
      Started At: ${new Date().toISOString()}
    `);
  },
};

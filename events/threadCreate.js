const { logger } = require('../components/loggerUtil.js');

module.exports = {
  name: 'threadCreate',
  execute(thread) {
    logger.info(`Thread created;
      Thread Name: ${thread.name} | ${thread.id},
      Created At: ${thread.createdAt.toISOString()},
      Guild: ${thread.guild.name} | ${thread.guild.id},
      Parent Channel: ${thread.parent.name} | ${thread.parent.id},
      Member Count: ${thread.members.size}
    `);
  },
};

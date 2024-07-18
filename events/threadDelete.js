const { logger } = require('../components/loggerUtil.js');

module.exports = {
  name: 'threadDelete',
  execute(thread) {
    logger.info(`Thread deleted;
      Thread Name: ${thread.name} | ${thread.id},
      Deleted At: ${new Date().toISOString()},
      Guild: ${thread.guild.name} | ${thread.guild.id},
      Parent Channel: ${thread.parent.name} | ${thread.parent.id},
      Member Count: ${thread.members.size}
    `);
  },
};

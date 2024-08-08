const { logger } = require('../../components/loggerUtil.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'threadListSync',
  execute(threads, guild) {
    logger.info(`Thread list synchronized;
      Guild: ${guild.name} | ${guild.id},
      Thread Count: ${threads.size},
      Synchronized At: ${new Date().toISOString()}
    `);

    // Update thread cache
    threads.forEach(thread => {
      cache.updateThread(thread);
      logger.debug(`Adding thread to cache: ${thread.name} (${thread.id})`);
    });
  },
};

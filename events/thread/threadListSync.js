const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'threadListSync',
  execute(threads, guild, client) {
    logger.info(`Thread list synchronized;
      Guild: ${guild.name} | ${guild.id},
      Thread Count: ${threads.size},
      Synchronized At: ${new Date().toISOString()}
    `);

    // Update thread cache
    threads.forEach(thread => {
      client.threads.set(thread.id, thread);
      logger.debug(`Adding thread to cache: ${thread.name} (${thread.id})`);
    });
  },
};

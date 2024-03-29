const logger = require('../components/logger.js');

module.exports = {
  name: 'threadListSync',
  execute(threads, guild) {
    logger.info(`Thread list synchronized;
      Guild: ${guild.name} | ${guild.id},
      Thread Count: ${threads.size},
      Synchronized At: ${new Date().toISOString()}
    `);
  },
};

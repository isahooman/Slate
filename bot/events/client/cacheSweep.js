const logger = require('#components/util/logger.js');

module.exports = {
  name: 'cacheSweep',
  execute(type, count) {
    logger.info(`Cache Sweep;
      Type: ${type},
      Number of Items Cleared: ${count}
    `);
  },
};

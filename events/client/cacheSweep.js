const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'cacheSweep',
  execute(type, number) {
    logger.info(`Cache Sweep;
      Type: ${type},
      Number of Items Cleared: ${number}
    `);
  },
};

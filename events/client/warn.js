const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'warn',
  execute(info) {
    logger.warn(`Warning;
      Info: ${info}
    `);
  },
};

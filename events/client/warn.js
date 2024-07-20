const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'warn',
  execute(info) {
    logger.warn(`Warning;
      Info: ${info}
    `);
  },
};

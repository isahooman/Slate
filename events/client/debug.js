const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'debug',
  execute(info) {
    logger.debug(`Debug information;
      Info: ${info}
    `);
  },
};

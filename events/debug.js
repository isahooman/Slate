const { logger } = require('../components/utils.js');

module.exports = {
  name: 'debug',
  execute(info) {
    logger.debug(`Debug information;
      Info: ${info}
    `);
  },
};

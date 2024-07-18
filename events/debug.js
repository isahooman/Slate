const { logger } = require('../components/loader.js');

module.exports = {
  name: 'debug',
  execute(info) {
    logger.debug(`Debug information;
      Info: ${info}
    `);
  },
};

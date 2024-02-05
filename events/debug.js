const logger = require('../components/logger.js');

module.exports = {
  name: 'debug',
  execute(info) {
    logger.debug(`Debug information;
      Info: ${info}
    `);
  },
};

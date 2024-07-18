const { logger } = require('../components/loader.js');

module.exports = {
  name: 'warn',
  execute(info) {
    logger.warn(`Warning;
      Info: ${info}
    `);
  },
};

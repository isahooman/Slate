const { logger } = require('../components/utils.js');

module.exports = {
  name: 'warn',
  execute(info) {
    logger.warn(`Warning;
      Info: ${info}
    `);
  },
};

const logger = require('../../components/logger.js');

module.exports = {
  name: 'warn',
  execute(info) {
    logger.warn(`Warning;
      Info: ${info}
    `);
  },
};

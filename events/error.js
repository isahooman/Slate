const logger = require('../components/logger.js');

module.exports = {
  name: 'error',
  execute(error) {
    logger.error(`Error;
      Message: ${error.message},
      Stack Trace: ${error.stack || 'N/A'}
    `);
  },
};

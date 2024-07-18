let logger = require('./logger.js');

/**
 * Reloads the logger by clearing its cache
 */
function reloadLogger() {
  delete require.cache[require.resolve('./loader.js')]; // Clear logger cache
  logger = require('./loader.js'); // Re-import the logger module
}

module.exports =
{
  reloadLogger,
  logger,
};

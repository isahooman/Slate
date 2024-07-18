let logger = require('./logger.js');
let { readJSON5, writeJSON5 } = require('./json5Parser.js');

/**
 * Reloads the logger by clearing its cache
 */
function reloadLogger() {
  delete require.cache[require.resolve('./loader.js')]; // Clear logger cache
  logger = require('./loader.js'); // Re-import the logger module
}

/**
 *
 */
function reloadJson5() {
  delete require.cache[require.resolve('./json5Parser.js')]; // Clear parser cache
  readJSON5 = require('./json5Parser.js').readJSON5; // Re-import the read function
  writeJSON5 = require('./json5Parser.js').writeJSON5; // Re-import the write function
}

module.exports =
{
  readJSON5,
  writeJSON5,
  reloadJson5,
  reloadLogger,
  logger,
};

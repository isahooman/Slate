const { proxyMessage, proxyInteraction } = require('./commandProxy.js');
const logger = require('../util/logger.js');

/**
 * Creates a proxied response object
 * @param {object} input - message or interaction object
 * @returns {Proxy} - Proxied object
 */
function createDisclaimerProxy(input) {
  // Determine if it's a message or interaction
  if (input.author) {
    // message uses authors
    logger.debug('Creating message proxy with disclaimer');
    return proxyMessage(input, addDisabledDisclaimer);
  } else if (input.user) {
    // interaction uses users
    logger.debug('Creating interaction proxy with disclaimer');
    return proxyInteraction(input, addDisabledDisclaimer);
  }
  // If neither, return original input
  logger.warn('Unable to determine input type for disclaimer proxy');
  return input;
}

/**
 * Adds a disclaimer to message content
 * @param {string | object} msgContent - message content
 * @returns {string | object} - the modified message
 */
function addDisabledDisclaimer(msgContent) {
  const disclaimer = '## ⚠️This command is disabled⚠️\n';
  logger.info('Adding disclaimer to content', { msgContent });

  // If the message content is a string add the disclaimer to it
  if (typeof msgContent === 'string') {
    logger.debug('Adding disclaimer to string content');
    return disclaimer + msgContent;
  }

  // If the message content is an object, modify its content property
  if (msgContent && typeof msgContent === 'object') {
    logger.info('Adding disclaimer to object content');
    // Create a copy of the message content
    const modifiedContent = { ...msgContent };

    // Add disclaimer to existing content
    if (modifiedContent.content) {
      logger.debug('Adding disclaimer to existing content property');
      modifiedContent.content = disclaimer + modifiedContent.content;
    } else {
      // If no content property, create one with the disclaimer
      logger.debug('Creating new content property with disclaimer');
      modifiedContent.content = disclaimer;
    }
    return modifiedContent;
  }

  // If the message content is not a string or object, return it as is
  logger.error('Unexpected content type', { type: typeof msgContent });
  return msgContent;
}

module.exports = createDisclaimerProxy;

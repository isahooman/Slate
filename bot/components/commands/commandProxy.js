const logger = require('../util/logger');

/**
 * Handles method calls with disclaimer function
 * @param {object} target - Target object
 * @param {string} methodName - Method name
 * @param {Function} disclaimerFn - disclaimer function
 * @param {boolean} shouldProxy - whether or not to proxy the object
 * @returns {Function} disclaimer function
 */
const createMethodHandler = (target, methodName, disclaimerFn, shouldProxy = false) =>
  async(msgContent) => {
    try {
      const result = await target[methodName](disclaimerFn(msgContent));
      return shouldProxy ? proxyMessageEdit(result, disclaimerFn) : result;
    } catch (error) {
      throw new Error(`Error in ${methodName} proxy handler: ${error.message}`);
      throw error;
    }
  };

/**
 * Proxies Discord messages
 * @param {object} message - Discord Message
 * @param {Function} disclaimerFn - disclaimer function
 * @returns {Proxy} Proxied message or original message
 */
function proxyMessage(message, disclaimerFn) {
  logger.debug(`Creating message proxy for: ${message.author.tag}`);

  return new Proxy(message, {
    get(target, prop) {
      if (prop === 'reply') return createMethodHandler(target, 'reply', disclaimerFn, true);
      if (prop === 'edit') return createMethodHandler(target, 'edit', disclaimerFn);
      if (prop === 'channel') return subproxyChannel(target.channel, disclaimerFn);

      return Reflect.get(target, prop);
    },
  });
}

/**
 * Proxies Discord message edit results
 * @param {object} msgObj - Edited message
 * @param {Function} disclaimerFn - disclaimer function
 * @returns {Proxy|*} Proxied object or original value
 */
function proxyMessageEdit(msgObj, disclaimerFn) {
  if (!msgObj || typeof msgObj !== 'object') return msgObj;

  return new Proxy(msgObj, {
    get(target, prop) {
      if (prop === 'edit') return createMethodHandler(target, 'edit', disclaimerFn);
      return Reflect.get(target, prop);
    },
  });
}

/**
 * Proxies Discord interaction objects
 * @param {object} interaction - Discord interaction
 * @param {Function} disclaimerFn - disclaimer function
 * @returns {Proxy} Proxied interaction
 */
function proxyInteraction(interaction, disclaimerFn) {
  logger.debug(`Creating interaction proxy for: ${interaction.user.tag}`);

  return new Proxy(interaction, {
    get(target, prop) {
      if (prop === 'reply' || prop === 'editReply') return createMethodHandler(target, prop, disclaimerFn);

      return Reflect.get(target, prop);
    },
  });
}

/**
 * Proxies Discord channel objects
 * @param {object} channel - Discord channel
 * @param {Function} disclaimerFn - disclaimer function
 * @returns {Proxy} Proxied channel
 */
function subproxyChannel(channel, disclaimerFn) {
  return new Proxy(channel, {
    get(target, prop) {
      if (prop === 'send') return createMethodHandler(target, 'send', disclaimerFn, true);
      return Reflect.get(target, prop);
    },
  });
}

module.exports = {
  proxyMessage,
  proxyInteraction,
  proxyMessageEdit,
  subproxyChannel,
};

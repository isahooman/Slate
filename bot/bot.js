const { Client, GatewayIntentBits } = require('discord.js');
const { loadAll, deployCommands, undeploy } = require('./components/core/loader');
const logger = require('./components/util/logger.js');
const configManager = require('../components/configManager');
let cooldownBuilder = require('./components/commands/cooldown.js');
let cache = new (require('./components/util/cache'));

/**
 * Validates essential configuration values
 * @returns {boolean} Whether all required configurations are valid
 */
function validateConfig() {
  const requiredConfigs = [
    { name: 'token', value: configManager.getConfigValue('config', 'token') },
    { name: 'clientId', value: configManager.getConfigValue('config', 'clientId') },
    { name: 'ownerId', value: configManager.getConfigValue('config', 'ownerId') },
    { name: 'prefix', value: configManager.getConfigValue('config', 'prefix') },
  ];

  const missingConfigs = [];

  for (const config of requiredConfigs) if (!config.value ||
        (typeof config.value === 'string' && config.value.trim() === '') ||
        (Array.isArray(config.value) && config.value.length === 0) ||
        (config.name === 'ownerId' && Array.isArray(config.value) &&
        (!config.value[0] || config.value[0].trim() === ''))) missingConfigs.push(config.name);

  if (missingConfigs.length > 0) {
    logger.warn(`Required config info is missing or empty: ${missingConfigs.join(', ')}`);
    return false;
  }

  return true;
}

const intents = configManager.loadConfig('intents');
const handleIntents = intentConfig => {
  let totalIntentsBits = [];
  for (const intent in intentConfig) if (intentConfig[intent]) totalIntentsBits.push(GatewayIntentBits[intent]);
  return totalIntentsBits;
};

// Create the Discord client
const client = new Client({
  intents: handleIntents(intents),
  shards: 'auto',
});

/**
 * Starts the bot and loads necessary data
 * @param {Client} bot - Discord Client
 */
async function startBot(bot) {
  logger.debug('Bot starting..');

  // Check for required config data
  if (!validateConfig()) {
    logger.error('Bot startup aborted due to missing configuration. Please fill out the required fields in the config.json5 file.');
    // Exit with 0 to avoid auto recovery
    process.exit(0);
  }

  // Load all events and commands
  await loadAll(bot);

  // Redeploy slash commands on startup
  const deployOnStart = configManager.getConfigValue('config', 'deployOnStart', false);
  if (deployOnStart) await deployCommands();

  // Login once preparations are done
  const token = configManager.getConfigValue('config', 'token');
  bot.login(token);
}

// Export modules
exports.client = client;
exports.cooldown = cooldownBuilder;
exports.cache = cache;

startBot(exports.client);

// Process Events
process
  .on('exit', message => {
    logger.error(`Shutdown because: ${message}`);
  })

  .on('warning', warning => {
    logger.warn(`${warning.name}\n${warning.message}\n${warning.stack}`);
  })

  .on('uncaughtException', async(err, origin) => {
    const startTime = Date.now();
    logger.error(`Caught exception: ${err}\nException origin: ${origin}\nStack Trace: ${err.stack}`);
    // Attempt to reconnect if the client died.
    if (!exports.client.user) try {
      logger.info('Attempting to reconnect to Discord...');
      await exports.client.login;
      const endTime = Date.now();
      logger.info(`Successfully reconnected in ${endTime - startTime}ms!`);
    } catch (error) {
      logger.error('Failed to reconnect:', error);
    }
    else logger.info('Client is logged in, skipping reconnect.');
  })

  .on('unhandledRejection', async(reason, message) => {
    const startTime = Date.now();
    logger.error(`Unhandled Rejection at:${message}\nReason:${reason.stack}`);
    // Attempt to reconnect if the client died.
    if (!exports.client.user) try {
      logger.info('Attempting to reconnect to Discord...');
      await exports.client.login;
      const endTime = Date.now();
      logger.info(`Successfully reconnected in ${endTime - startTime}ms!`);
    } catch (error) {
      logger.error('Failed to reconnect:', error);
    }
    else logger.info('Client is logged in, skipping reconnect.');
  })

  .on('SIGINT', async() => {
    logger.info('Received SIGINT. Shutting down...');

    // Get undeployOnExit configuration
    const undeployOnExit = configManager.getConfigValue('config', 'undeployOnExit', false);

    // Undeploy commands if true in config
    if (undeployOnExit) try {
      await undeploy();
    } catch (error) {
      logger.error(`Error during undeploy: ${error}`);
    }
    // Logout of Discord
    await exports.client.destroy();
    logger.info('Bot successfully logged out.');

    process.exit(0);
  });

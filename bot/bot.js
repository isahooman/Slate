const { Client, GatewayIntentBits } = require('discord.js');
const { loadAll, deployCommands, undeploy } = require('./components/core/loader');
const logger = require('./components/util/logger.js');
const configManager = require('../components/configManager');
let cooldownBuilder = require('./components/commands/cooldown.js');
let cache = new (require('./components/util/cache'));

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

  // Load all events and commands
  await loadAll(bot);

  // Get config values
  const clientId = configManager.getConfigValue('config', 'clientId');
  const token = configManager.getConfigValue('config', 'token');
  const guildId = configManager.getConfigValue('config', 'guildId');
  const deployOnStart = configManager.getConfigValue('config', 'deployOnStart', false);

  // Redeploy slash commands on startup
  if (deployOnStart) await deployCommands(bot, clientId, guildId, token);

  // Login once preparations are done
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
    // Delete the temp directory
    const fs = require('fs');
    const tempDir = './temp';
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
      logger.info('Deleted temp directory.');
    }

    process.exit(0);
  });

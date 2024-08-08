const { readJSON5 } = require('./components/json5Parser.js');
const { clientId, token, guildId, deployOnStart, undeployOnExit } = readJSON5('./config/config.json5');
const ConfigIntents = require('./config/intents.json');
const { Client, GatewayIntentBits } = require('discord.js');
const { loadAll, deployCommands, undeploy } = require('./components/loader.js');
const { logger } = require('./components/loggerUtil.js');
let cooldownBuilder = require('./components/cooldown.js');
let cache = new (require('./components/cache.js'));

const handleIntents = intents => {
  let totalIntentsBits = [];
  for (const intent in intents) if (intents[intent]) totalIntentsBits.push(GatewayIntentBits[intent]);
  return totalIntentsBits;
};

exports.client = new Client({
  intents: handleIntents(ConfigIntents),
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

  // Redeploy slash commands on startup
  if (deployOnStart) await deployCommands(bot, clientId, guildId, token);

  // Login once preparations are done
  bot.login(token);
}

// Cooldowns globalized
exports.cooldown = cooldownBuilder;
// Cache globalized
exports.cache = cache;

startBot(this.client);

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
    if (!this.client.user) try {
      logger.info('Attempting to reconnect to Discord...');
      await this.client.login;
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
    if (!this.client.user) try {
      logger.info('Attempting to reconnect to Discord...');
      await this.client.login;
      const endTime = Date.now();
      logger.info(`Successfully reconnected in ${endTime - startTime}ms!`);
    } catch (error) {
      logger.error('Failed to reconnect:', error);
    }
    else logger.info('Client is logged in, skipping reconnect.');
  })

  .on('SIGINT', async() => {
    logger.info('Received SIGINT. Shutting down...');
    // Undeploy commands if true in config
    if (undeployOnExit) try {
      await undeploy(clientId, guildId, token);
    } catch (error) {
      logger.error(`Error during undeploy: ${error}`);
    }
    // Logout of Discord
    await this.client.destroy();
    logger.info('Bot successfully logged out.');
    process.exit(0);
  });

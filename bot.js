const { readJSON5 } = require('./components/json5Parser.js');
const { clientId, token, guildId, deployOnStart } = readJSON5('./config/config.json5');
const ConfigIntents = require('./config/intents.json');
const { deployCommands } = require('./components/deploy.js');
const { Client, GatewayIntentBits } = require('discord.js');
const { loadAll } = require('./components/loader.js');
const logger = require('./components/logger.js');
let cooldownBuilder = require('./components/cooldown.js');

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

startBot(this.client);

// Process Events
/*
process.on('exit', message => {
  logger.error(`Shutdown because: ${message}`);
}).on('uncaughtException', (err, origin) => {
  logger.error(`Caught exception: ${err}\nException origin: ${origin}`);
}).on('unhandledRejection', (reason, promise) => {
  promise.then(message => logger.error(`Unhandled Rejection at:${message}\nReason:${reason}`)).catch(err => logger.error(err));
}).on('warning', warning => {
  logger.warn(`${warning.name}\n${warning.message}\n${warning.stack}`);
});
*/

const { clientId, token, guildId } = require('./config/config.json');
const { deployCommands } = require('./components/deploy.js');
const { Client, GatewayIntentBits } = require('discord.js');
const { loadAll } = require('./components/loader.js');
const logger = require('./components/logger.js');

const client = new Client({
  intents:
  [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function startBot() {
  logger.debug('Bot starting..');

  // Load all events and commands
  await loadAll(client);

  // Redeploy slash commands on startup
  await deployCommands(client, clientId, guildId, token);

  // Login once preparations are done
  client.login(token);
}

startBot();

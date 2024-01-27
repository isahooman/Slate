const { Client, GatewayIntentBits } = require('discord.js');
const { clientId, token, guildId } = require('./config.json');
const deployCommands = require('./components/deploy.js');
const loadAll = require('./components/loader.js');
const logger = require('./components/logger.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

logger.debug('Bot starting..');

// Load all events and commands
loadAll(client);

// Redeploy slash commands on startup
deployCommands(client, clientId, guildId, token);

client.login(token);

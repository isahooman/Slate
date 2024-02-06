const { clientId, token, guildId } = require('./config/config.json');
const { deployCommands } = require('./components/deploy.js');
const { Client, GatewayIntentBits } = require('discord.js');
const { loadAll } = require('./components/loader.js');
const logger = require('./components/logger.js');

exports.client = new Client({
  intents:
  [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,

    /*
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessageReactions,
    */

    GatewayIntentBits.MessageContent,

    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.AutoModerationConfiguration,
  ],
  shards: 'auto',
});

async function startBot(bot) {
  logger.debug('Bot starting..');

  // Load all events and commands
  await loadAll(bot);

  // Redeploy slash commands on startup
  await deployCommands(bot, clientId, guildId, token);

  // Login once preparations are done
  bot.login(token);
}

startBot(this.client);


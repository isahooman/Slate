const statuses = require('../../config/status.json');
const { logger } = require('../../components/loggerUtil.js');
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.start(`Logged in as ${client.user.tag}!`);
    logger.debug('Bot is ready and online.');

    // Cache servers
    client.guilds.cache.forEach(guild => {
      logger.debug(`Adding guild to cache: ${guild.name} (${guild.id})`);
    });

    // Cache all channels
    client.textChannels = new Map();
    client.voiceChannels = new Map();
    client.channels.cache.forEach(channel => {
      if (channel.type === 'GUILD_TEXT') client.textChannels.set(channel.id, channel);
      else if (channel.type === 'GUILD_VOICE') client.voiceChannels.set(channel.id, channel);
    });

    // Initialize the threads Map
    client.threads = new Map();

    // Cache threads for each guild
    client.guilds.cache.forEach(guild => {
      guild.channels.cache.forEach(channel => {
        if (channel.isThread()) client.threads.set(channel.id, channel);
      });
      logger.info(`Cached: ${client.threads.size}, threads for guild: ${guild.name}`);
    });

    // Cache all guild members
    client.guilds.cache.forEach(async guild => {
      try {
        await guild.members.fetch();
        logger.info(`Cached all members for guild: ${guild.name} (${guild.id})`);
      } catch (error) {
        logger.error(`Error caching members for guild: ${guild.name} (${guild.id})`, error);
      }
    });

    // Set the bot status status
    const updateStatus = () => {
      // Exclude empty types
      const nonEmptyTypes = Object.keys(statuses).filter(type => statuses[type].length > 0);

      // Check if any non-empty types are available
      if (nonEmptyTypes.length === 0) {
        logger.debug('All activity types empty. Skipping status update.');
        return;
      }

      // Select a random activity type
      const randomType = nonEmptyTypes[Math.floor(Math.random() * nonEmptyTypes.length)];
      const activity = statuses[randomType][Math.floor(Math.random() * statuses[randomType].length)];

      // Set the types
      let discordActivityType;
      switch (randomType) {
        case 'playing':
          discordActivityType = ActivityType.Playing;
          break;
        case 'streaming':
          discordActivityType = ActivityType.Streaming;
          break;
        case 'listening':
          discordActivityType = ActivityType.Listening;
          break;
        case 'watching':
          discordActivityType = ActivityType.Watching;
          break;
        default:
          discordActivityType = ActivityType.Playing;
      }

      // Log the status change
      logger.debug(`Updating status to: ${randomType} ${activity}`);

      // Update the bot's activity
      client.user.setActivity(activity, { type: discordActivityType });
    };

    // Update status on startup and then once every 3 minutes
    updateStatus();
    setInterval(updateStatus, 180000);
  },
};

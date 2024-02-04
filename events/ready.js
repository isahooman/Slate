const statuses = require('../config/status.json');
const logger = require('../components/logger.js');
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.start(`Logged in as ${client.user.tag}!`);
    logger.debug('Bot is ready and online.');

    // Set the bot status status
    const updateStatus = () => {
      // Select a random activity type
      const activityTypes = Object.keys(statuses);
      const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      // Select a random activity from the chosen type
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

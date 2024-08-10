const { logger } = require('../../../components/loggerUtil.js');
const { EmbedBuilder } = require('discord.js');
const { inspect } = require('util');
const { cache } = require('../../../bot.js');

module.exports = {
  name: 'cache',
  usage: 'cache <clear/refresh/stats>',
  category: 'Owner',
  aliases: [],
  nsfw: false,
  allowDM: true,
  description: 'Cache management',
  execute(message, args) {
    const arg = args[0];

    if (arg === 'clear' || arg === 'refresh' || arg === 'reload') {
      logger.info('[Cache Command] Clearing cache.');
      // Clear existing cache data
      cache.guilds.clear();
      cache.channels.clear();
      cache.threads.clear();
      cache.members.clear();
      // Gather new data
      cache.cacheServers(message.client);
      cache.cacheChannels(message.client);
      cache.cacheThreads(message.client);
      message.client.guilds.cache.forEach(guild => {
        cache.cacheMembers(guild);
      });
      message.reply('Cache refreshed!');
    } else if (arg === 'stats' || !arg) {
      logger.info('[Cache Command] Displaying cache stats.');
      // Display cache stats
      const embed = new EmbedBuilder()
        .setTitle('Cache Statistics')
        .addFields(
          { name: 'Guilds', value: `Total: ${cache.guilds.size}` },
          { name: 'Channels', value: `Total: ${cache.channels.size}\nThis guild: ${message.guild ? message.guild.channels.cache.size : 0}`, inline: true },
          { name: 'Users', value: `Total: ${cache.members.size}\nThis guild: ${message.guild ? message.guild.memberCount : 0}`, inline: true },
          { name: 'Threads', value: `Total: ${cache.threads.size}\nThis guild: ${message.guild ? message.guild.channels.cache.filter(channel => channel.isThread()).size : 0}`, inline: true },
        )
        .setFooter({ text: `Cache Size: ${getCacheSize(cache)}` });
      message.reply({ embeds: [embed] });

      // Log the stats
      logger.info(`[Cache Command] Cache Stats:`);
      logger.info(`- Total Guilds: ${cache.guilds.size}`);
      logger.info(`- Total Channels: ${cache.channels.size}`);
      logger.info(`- Total Users: ${cache.members.size}`);
      logger.info(`- Total Threads: ${cache.threads.size}`);
      logger.info(`- Cache Size: ${getCacheSize(cache)}`);

      // Log current guild stats
      if (message.guild) {
        logger.info(`[Cache Command] Current Guild Stats:`);
        logger.info(`- Guild Name: ${message.guild.name}`);
        logger.info(`- Guild ID: ${message.guild.id}`);
        logger.info(`- Channels: ${message.guild.channels.cache.size}`);
        logger.info(`- Members: ${message.guild.memberCount}`);
        logger.info(`- Threads: ${message.guild.channels.cache.filter(channel => channel.isThread()).size}`);
      }
    } else {
      logger.warn(`[Cache Command] Invalid action: ${arg}`);
      message.reply('Invalid action.');
    }
  },
};

/**
 *
 * @param {cache} cacheInstance - The cache instance.
 * @returns {string} - The approximate cache size.
 */
function getCacheSize(cacheInstance) {
  logger.debug('[Cache Command] Calculating cache size.');
  let totalSize = 0;

  // Calculate size of the cache
  totalSize += inspect(cacheInstance.guilds).length;
  totalSize += inspect(cacheInstance.channels).length;
  totalSize += inspect(cacheInstance.members).length;
  totalSize += inspect(cacheInstance.threads).length;

  // Convert size to KB, MB, or GB
  const sizeKB = totalSize / 1024;
  if (sizeKB < 1024) return `${sizeKB.toFixed(2)} KB`;
  const sizeMB = sizeKB / 1024;
  if (sizeMB < 1024) return `${sizeMB.toFixed(2)} MB`;
  const sizeGB = sizeMB / 1024;
  return `${sizeGB.toFixed(2)} GB`;
}

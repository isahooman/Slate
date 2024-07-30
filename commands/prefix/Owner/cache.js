const { logger } = require('../../../components/loggerUtil.js');
const { EmbedBuilder } = require('discord.js');
const { inspect } = require('util');

module.exports = {
  name: 'cache',
  usage: 'cache <clear/refresh/stats>',
  category: 'Owner',
  aliases: [''],
  nsfw: false,
  allowDM: true,
  description: 'Cache management',
  execute(message, args) {
    const action = args[0]?.toLowerCase();

    if (action === 'clear' || action === 'refresh') {
      // Reload all cache
      reloadCache(message.client);
      message.reply('Cache cleared/refreshed!');
    } else if (action === 'stats' || !action) {
      // Display cache stats
      const embed = new EmbedBuilder()
        .setTitle('Cache Statistics')
        .addFields(
          { name: 'Guilds', value: `Total: ${message.client.guilds.cache ? message.client.guilds.cache.size : 0}` },
          { name: 'Channels', value: `Total: ${message.client.channels.cache ? message.client.channels.cache.size : 0}\nThis guild: ${message.guild ? message.guild.channels.cache.size : 0}`, inline: true },
          { name: 'Users', value: `Total: ${message.client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0)}\nThis guild: ${message.guild ? message.guild.memberCount : 0}`, inline: true },
          { name: 'Threads', value: `Total: ${message.client.threads.size}\nThis guild: ${message.guild ? message.guild.channels.cache.filter(channel => channel.isThread()).size : 0}`, inline: true },
        )
        .setFooter({ text: `Cache Size: ${getCacheSize(message.client)}` });
      message.reply({ embeds: [embed] });
    } else {
      message.reply('Invalid action.');
    }
  },
};

/**
 * Function to refresh cache
 * @param {client} client - Discord client
 */
function reloadCache(client) {
  // Reload guilds
  client.guilds.cache.forEach(guild => {
    client.servers.set(guild.id, guild);
    logger.debug(`Adding guild to cache: ${guild.name} (${guild.id})`);
  });

  // Reload channels
  client.textChannels = new Map();
  client.voiceChannels = new Map();
  client.channels.cache.forEach(channel => {
    if (channel.type === 'GUILD_TEXT') client.textChannels.set(channel.id, channel);
    else if (channel.type === 'GUILD_VOICE') client.voiceChannels.set(channel.id, channel);
  });

  // Reload threads
  client.threads = new Map();
  client.guilds.cache.forEach(guild => {
    guild.channels.cache.forEach(channel => {
      if (channel.isThread()) client.threads.set(channel.id, channel);
    });
    logger.info(`Cached: ${client.threads.size}, threads for guild: ${guild.name}`);
  });

  // Reload members
  client.guilds.cache.forEach(async guild => {
    try {
      await guild.members.fetch();
      logger.info(`Cached all members for guild: ${guild.name} (${guild.id})`);
    } catch (error) {
      logger.error(`Error caching members for guild: ${guild.name} (${guild.id})`, error);
    }
  });
}

/**
 * Calculates the approximate size of the client cache.
 * @param {client} client - The Discord client instance.
 * @returns {string} - The approximate cache size.
 */
function getCacheSize(client) {
  let totalSize = 0;

  // Calculate size of the cache
  if (client.threads && client.guilds.cache) totalSize += inspect(client.guilds.cache).length;
  if (client.threads && client.channels.cache) totalSize += inspect(client.channels.cache).length;
  if (client.threads && client.users.cache) totalSize += inspect(client.users.cache).length;
  if (client.threads && client.threads.cache) totalSize += inspect(client.threads.cache).length;

  // Convert size to KB, MB, or GB
  const sizeKB = totalSize / 1024;
  if (sizeKB < 1024) return `${sizeKB.toFixed(2)} KB`;
  const sizeMB = sizeKB / 1024;
  if (sizeMB < 1024) return `${sizeMB.toFixed(2)} MB`;
  const sizeGB = sizeMB / 1024;
  return `${sizeGB.toFixed(2)} GB`;
}

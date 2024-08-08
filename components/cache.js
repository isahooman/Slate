const { Guild, Channel, ThreadChannel, GuildMember, Snowflake } = require('discord.js');
const { logger } = require('./loggerUtil.js');

class CacheHandler {
  constructor() {
    this.guilds = new Map();
    this.channels = new Map();
    this.threads = new Map();
    this.members = new Map();
  }

  /**
   * Updates a specific guild in the cache.
   * @param {Guild} guild The guild to update.
   * @author isahooman
   */
  updateGuild(guild) {
    this.guilds.set(guild.id, guild);
    logger.debug(`Updating guild in cache: ${guild.name} (${guild.id})`);
  }

  /**
   * Updates a specific channel in the cache.
   * @param {Channel} channel The channel to update.
   * @author isahooman
   */
  updateChannel(channel) {
    this.channels.set(channel.id, channel);
    logger.debug(`Updating channel in cache: ${channel.name} (${channel.id})`);
  }

  /**
   * Updates a specific thread in the cache.
   * @param {ThreadChannel} thread The thread to update.
   * @author isahooman
   */
  updateThread(thread) {
    this.threads.set(thread.id, thread);
    logger.debug(`Updating thread in cache: ${thread.name} (${thread.id})`);
  }

  /**
   * Updates a specific member in the cache.
   * @param {GuildMember} member The member to update.
   * @author isahooman
   */
  updateMember(member) {
    this.members.set(member.id, member);
    logger.debug(`Updating member in cache: ${member.user.tag} (${member.id})`);
  }

  /**
   * Removes a specific guild from the cache.
   * @param {Snowflake} guildId The ID of the guild to remove.
   * @author isahooman
   */
  removeGuild(guildId) {
    this.guilds.delete(guildId);
    logger.debug(`Removing guild from cache: ${guildId}`);
  }

  /**
   * Removes a specific channel from the cache.
   * @param {Snowflake} channelId The ID of the channel to remove.
   * @author isahooman
   */
  removeChannel(channelId) {
    this.channels.delete(channelId);
    logger.debug(`Removing channel from cache: ${channelId}`);
  }

  /**
   * Removes a specific thread from the cache.
   * @param {Snowflake} threadId The ID of the thread to remove.
   * @author isahooman
   */
  removeThread(threadId) {
    this.threads.delete(threadId);
    logger.debug(`Removing thread from cache: ${threadId}`);
  }

  /**
   * Removes a specific member from the cache.
   * @param {Snowflake} memberId The ID of the member to remove.
   * @author isahooman
   */
  removeMember(memberId) {
    this.members.delete(memberId);
    logger.debug(`Removing member from cache: ${memberId}`);
  }

  /**
   * Caches all servers on startup.
   * @param {client} client The Discord client.
   * @author isahooman
   */
  cacheServers(client) {
    client.guilds.cache.forEach(guild => {
      this.updateGuild(guild);
    });
  }

  /**
   * Caches all channels on startup.
   * @param {client} client The Discord client.
   * @author isahooman
   */
  cacheChannels(client) {
    client.channels.cache.forEach(channel => {
      this.updateChannel(channel);
    });
  }

  /**
   * Caches all threads on startup.
   * @param {client} client The Discord client.
   * @author isahooman
   */
  cacheThreads(client) {
    client.guilds.cache.forEach(guild => {
      guild.channels.cache.forEach(channel => {
        if (channel.isThread()) this.updateThread(channel);
      });
    });
  }

  /**
   * Caches all members for a specific guild.
   * @param {Guild} guild The guild to cache members for.
   * @returns {Promise<void>} A promise that resolves when the members have been cached.
   * @author isahooman
   */
  cacheMembers(guild) {
    return guild.members.fetch().then(fetchedMembers => {
      try {
        if (!fetchedMembers) throw new Error('Fetched members are undefined or null');

        // Log the fetched members
        logger.debug(`Fetched members for guild: ${guild.name} (${guild.id}): ${fetchedMembers.size} members`);

        fetchedMembers.forEach(member => {
          this.updateMember(member);
        });

        logger.info(`Cached all members for guild: ${guild.name} (${guild.id})`);
      } catch (error) {
        logger.error(`Error caching members for guild: ${guild.name} (${guild.id})\n${error}`);
      }
    }).catch(error => {
      logger.error(`Error fetching members for guild: ${guild.name} (${guild.id})\n${error.message}`);
    });
  }

  /**
   * Gets a cached guild by its ID.
   * @param {Snowflake} guildId The ID of the guild to retrieve.
   * @returns {Guild | undefined} The cached guild, or undefined if not found.
   * @author isahooman
   */
  getGuild(guildId) {
    return this.guilds.get(guildId);
  }

  /**
   * Gets a cached channel by its ID.
   * @param {Snowflake} channelId The ID of the channel to retrieve.
   * @returns {Channel | undefined} The cached channel, or undefined if not found.
   * @author isahooman
   */
  getChannel(channelId) {
    return this.channels.get(channelId);
  }

  /**
   * Gets a cached thread by its ID.
   * @param {Snowflake} threadId The ID of the thread to retrieve.
   * @returns {ThreadChannel | undefined} The cached thread, or undefined if not found.
   * @author isahooman
   */
  getThread(threadId) {
    return this.threads.get(threadId);
  }

  /**
   * Gets a cached member by its ID.
   * @param {Snowflake} memberId The ID of the member to retrieve.
   * @returns {GuildMember | undefined} The cached member, or undefined if not found.
   * @author isahooman
   */
  getMember(memberId) {
    return this.members.get(memberId);
  }
}

module.exports = CacheHandler;

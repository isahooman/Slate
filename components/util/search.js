const logger = require('./logger.js');
const imageFiles = [
  'image/jpg',
  'image/jpeg',
  'image/png',
];

class Search {
/**
 * Searches for a Discord member by username, nickname, mention, or ID.
 * @param {import('discord.js').Message} message The Discord message object.
 * @param {string} nameOrPattern The search query.
 * @param {boolean} [global] Whether to search globally.
 * @returns {Promise<import('discord.js').GuildMember[]|import('discord.js').User[]|null>} An array of matching members or users, or null if no matches found.
 * @author EthanLawr
 */
  async member(message, nameOrPattern, global = false) {
  // Return the mentioned member if applicable.
    if (message.mentions.members.first()) {
      logger.debug('Found member by mention.');
      return [message.mentions.members.last()];
    }

    // Remove mention characters from the search query.
    nameOrPattern = nameOrPattern.replace(/<@!|<@|>|&lt;@!|&lt;@|&gt;/g, '');

    // Check if the search query is a user ID.
    const isId = /^\d{17,20}$/.test(nameOrPattern);

    // Attempt to fetch a user globally by ID if applicable.
    if (isId && global) try {
      logger.debug(`Attempting to fetch member globally by ID: ${nameOrPattern}`);
      const user = await message.client.users.fetch(nameOrPattern);
      if (user) {
        logger.info(`Found user globally: ${user.tag}`);
        return [user];
      }
    } catch (error) {
      logger.error(`Error fetching user globally: ${error.message}`);
    }

    // Create a regular expression for the search query.
    const pattern = new RegExp(escapeRegExp(nameOrPattern), 'i');
    // Initialize an array to store matching members.
    const match = [];

    // Iterate over cached members and check for matches.
    for (const member of message.guild.members.cache.values()) if (pattern.test(member.user.username) || pattern.test(member.displayName) || pattern.test(member.nickname) || (isId && member.id === nameOrPattern)) match.push(member);

    // Log a warning if no members are found.
    if (match.length === 0) {
      logger.warn(`No members found matching ${nameOrPattern}`);
      return null;
    } else {
    // Log the number of matching members found.
      logger.info(`Found ${match.length} members matching ${nameOrPattern}`);
    }

    // Return the array of matching members.
    return match;
  }

  /**
   * Searches for a Discord role by name or ID.
   * @param {import('discord.js').Message} message The Discord message object.
   * @param {string} nameOrPattern The search query.
   * @returns {import('discord.js').Role[]} An array of matching roles.
   * @author EthanLawr
   */
  role(message, nameOrPattern) {
    // Remove mention characters from the search query.
    nameOrPattern = nameOrPattern.replace(/<@&|>|&lt;@&amp;|&gt;/g, '');
    // Create a regular expression for the search query.
    const pattern = new RegExp(escapeRegExp(nameOrPattern), 'i');
    // Initialize an array to store matching roles.
    const match = [];

    // Iterate over cached roles and check for matches.
    for (const role of message.guild.roles.cache.values()) if (pattern.test(role.name) || (nameOrPattern === role.id)) match.push(role);

    // Log a warning if no roles are found or the number of matches found
    if (match.length === 0) logger.warn(`No roles found matching ${nameOrPattern}`);
    else logger.info(`Found ${match.length} roles matching ${nameOrPattern}`);

    // Return the array of matching roles.
    return match;
  }

  /**
   * Searches for a Discord channel by name or ID.
   * @param {import('discord.js').Message} message The Discord message object.
   * @param {string} nameOrPattern The search query.
   * @returns {import('discord.js').GuildChannel[]} An array of matching channels.
   * @author EthanLawr
   */
  channel(message, nameOrPattern) {
    // Create a regular expression for the search query.
    const pattern = new RegExp(escapeRegExp(nameOrPattern), 'i');
    // Initialize an array to store matching channels.
    const match = [];
    // Filter for text and voice channels, excluding categories.
    const toLook = message.guild.channels.cache.filter(c => (c.type === 'text' || c.type === 'voice') && c.type !== 'category');

    // Iterate over filtered channels and check for matches.
    for (const channel of toLook.values()) {
      const channelName = channel.name.replace(/\u205F/g, ' ');
      if (pattern.test(channelName) || channel.id === nameOrPattern) match.push(channel);
    }

    // Log a warning if no channels are found, or the number of channels found
    if (match.length === 0) logger.warn(`No channels found matching ${nameOrPattern}`);
    else logger.info(`Found ${match.length} channels matching ${nameOrPattern}`);

    // Return the array of matching channels.
    return match;
  }

  /**
   * Searches for a Discord image by URL, attachments, embeds, or author avatar.
   * @param {import('discord.js').Message} message The Discord message object.
   * @param {boolean} [bool] Whether to return the attachment object instead of the URL.
   * @returns {Promise<string|import('discord.js').Attachment|object>} The image URL, attachment object, or author avatar URL.
   * @author EthanLawr
   */
  async image(message, bool = false) {
    // Check for mentioned user avatar.
    if (message.mentions.users.first()) {
      logger.debug('Image search: Found avatar by mention.');
      return message.mentions.users.first().displayAvatarURL({ extension: 'png', size: 512 });
    }

    // Check for message attachments.
    if (message.attachments.size > 0) {
      logger.debug('Image Search: Found image from attachments.');
      return bool ? message.attachments.first() : message.attachments.first().url;
    }

    // Check for referenced message attachments or author avatar.
    if (message.reference) {
      const refMsg = await message.channel.messages.fetch(message.reference.messageId);
      if (refMsg.attachments && refMsg.attachments.size > 0) {
        logger.debug('Image Search: Found image from reference attachments.');
        return bool ? refMsg.attachments.first() : refMsg.attachments.first().url;
      }
      logger.debug('Image Search: Found avatar from reference author.');
      return refMsg.author.displayAvatarURL({ extension: 'png', size: 512 });
    }

    // Check message history for attachments or embeds.
    const msgList = message.channel.messages.cache.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    for (const msg of msgList.values()) {
      if (msg.attachments && msg.attachments.size > 0 && imageFiles.includes(msg.attachments.first().contentType)) {
        logger.debug('Image Search: Found image from channel history (attachments).');
        return bool ? msg.attachments.first() : msg.attachments.first().url;
      }

      if (msg.embeds && msg.embeds[0]) if (msg.embeds[0].data.thumbnail) {
        logger.debug('Image Search: Found image from channel history (embed thumbnail).');
        return bool ? msg.embeds[0].data.thumbnail : msg.embeds[0].data.thumbnail.url;
      } else if (msg.embeds[0].data.image) {
        logger.debug('Image Search: Found image from channel history (embed image).');
        return bool ? msg.embeds[0].data.image : msg.embeds[0].data.image.url;
      }
    }

    // Return author avatar as fallback.
    logger.debug('Image Search: Using author\'s avatar as fallback.');
    return message.author.displayAvatarURL({ extension: 'png', size: 512 });
  }

  /**
   * Calculates the probability of picking a specific value from a Set.
   * @param {Set<number>} set A set of numerical probabilities.
   * @returns {number | null} The selected value from the set, or null if the input is invalid or no value is selected.
   * @author EthanLawr
   */
  probability(set) {
    // Validate input.
    if (!(set instanceof Set)) {
      logger.error('Invalid input type for probability calculation. Must be a Set.');
      return null;
    }

    // Calculate the sum of probabilities.
    let sum = 0;
    for (const value of set) sum += value;

    // Generate a random number within the sum range.
    let pick = Math.random() * sum;

    // Iterate over the set and determine the selected value.
    for (const value of set) {
      pick -= value;
      if (pick <= 0) return value;
    }
    return null;
  }
}

/**
 * Escapes special characters in a regular expression.
 * @param {string} string The string to escape.
 * @returns {string} The escaped string.
 * @author EthanLawr
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = Search;

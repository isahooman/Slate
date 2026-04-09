const { EmbedBuilder } = require('discord.js');
const logger = require('#components/util/logger.js');
const search = new (require('#components/util/search.js'))();

module.exports = {
  name: 'avatar',
  usage: 'avatar <@user>|<user id>',
  category: 'utility',
  aliases: ['av', 'pfp'],
  allowDM: false,
  description: 'Send the avatar of a user.',
  async execute(message, args) {
    let member = null;
    let user = null;

    if (message.reference) {
      // Use the author of the replied-to message
      try {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        member = await message.guild.members.fetch(repliedMessage.author.id).catch(() => null);
        user = member ? member.user : repliedMessage.author;
      } catch {
        return message.channel.send('Error fetching the replied-to message.');
      }
    } else if (args.length === 0) {
      // Use message author if no arguments provided
      member = message.member;
      user = member.user;
    } else {
      // Search for the specified user
      const searchResults = await search.member(message, args.join(' '));

      if (searchResults && searchResults.length === 1) {
        member = searchResults[0];
        user = member.user;
      } else if (!searchResults || searchResults.length === 0) {
        member = null;
      } else {
        return message.channel.send('Multiple users found. Please be more specific.');
      }
    }

    if (!member && !user) return message.channel.send('No users found.');

    const target = member || user;
    const avatarURL = target.displayAvatarURL({ size: 4096 });

    logger.debug(`[Avatar Command] Retrieving avatar for user ${user.tag}`);

    const embed = new EmbedBuilder()
      .setTitle(`${target.displayName}'s Avatar`)
      .setURL(avatarURL)
      .setImage(avatarURL);

    try {
      await message.channel.send({ embeds: [embed] });
      logger.info(`[Avatar Command] Avatar sent for ${user.tag}`);
    } catch (error) {
      throw new Error(`[Avatar Command] Error sending avatar for ${user.tag}: ${error}`);
    }
  },
};

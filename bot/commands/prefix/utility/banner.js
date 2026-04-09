const { EmbedBuilder } = require('discord.js');
const logger = require('#components/util/logger.js');
const search = new (require('#components/util/search.js'))();

module.exports = {
  name: 'banner',
  usage: 'banner <@user>|<user id>|<username>',
  category: 'utility',
  allowDM: false,
  description: 'Send the banner of a provided user.',
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
      // No arguments — use the message author
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
    const targetUser = member ? member.user : user;

    logger.debug(`[Banner Command] Retrieving banner for user ${targetUser.tag}`);

    try {
      // Fetch user to ensure banner data is populated
      const fetchedUser = await message.client.users.fetch(targetUser.id, { force: true });
      const bannerURL = fetchedUser.bannerURL({ size: 4096 });

      if (!bannerURL) return message.channel.send('This user does not have a banner.');

      const embed = new EmbedBuilder()
        .setTitle(`${target.displayName}'s Banner`)
        .setURL(bannerURL)
        .setImage(bannerURL);

      await message.channel.send({ embeds: [embed] });
      logger.info(`[Banner Command] Banner sent for ${targetUser.tag}`);
    } catch (error) {
      throw new Error(`[Banner Command] Error fetching user data: ${error}`);
    }
  },
};

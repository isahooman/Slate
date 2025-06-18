const { EmbedBuilder } = require('discord.js');
const logger = require('../../../components/util/logger.js');
const search = new (require('../../../components/util/search.js'))();

module.exports = {
  name: 'banner',
  usage: 'banner <@user>|<user id>|<username>',
  category: 'Utility',
  allowDM: false,
  description: 'Send the banner of a provided user.',
  async execute(message, args) {
    let user;

    if (message.reference) {
      // Check if the message is a reply
      try {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        user = repliedMessage.author;
      } catch {
        return message.channel.send('[Banner Command] Error fetching the replied-to message.');
      }
    } else if (args.length === 0) {
      // If no arguments provided, use the message author
      user = message.author;
    } else {
      // Search for the user
      const searchResults = await search.member(message, args.join(' '));

      if (searchResults.length === 1) user = searchResults[0].user;
      else if (searchResults.length === 0) user = null;
      else return message.channel.send('Multiple users found. Please be more specific.');
    }

    // If no user is found
    if (!user) return message.channel.send('No users found.');

    logger.debug(`[Banner Command] Retrieving banner for user ${user.tag}`);

    try {
      // Fetch user data
      user = await message.client.users.fetch(user.id, { force: true });

      // Check if user has a banner
      if (!user.banner) return message.channel.send('This user does not have a banner.');

      // Create and send the embed
      const embed = new EmbedBuilder()
        .setTitle(`${user.displayName}'s Banner`)
        .setURL(user.bannerURL({ dynamic: true, size: 4096 }))
        .setImage(user.bannerURL({ dynamic: true, size: 4096 }));

      message.channel.send({ embeds: [embed] })
        .then(() => logger.info(`[Banner Command] Banner sent for ${user.tag}`))
        .catch(error => logger.error(`[Banner Command] Error sending banner for ${user.tag}: ${error}`));
    } catch (error) {
      logger.error(`[Banner Command] Error: ${error}`);
      return message.channel.send('Error fetching banner data.');
    }
  },
};

const { EmbedBuilder } = require('discord.js');
const logger = require('../../../components/util/logger.js');
const search = new (require('../../../components/util/search.js'))();

module.exports = {
  name: 'avatar',
  usage: 'avatar <@user>|<user id>',
  category: 'Utility',
  aliases: ['av', 'pfp'],
  allowDM: false,
  description: 'Send the avatar of a user.',
  async execute(message, args) {
    let user;

    // Check if the message is a reply
    if (message.reference) {
      try {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        user = repliedMessage.author;
      } catch {
        return message.channel.send('[Avatar Command] Error fetching the replied-to message.');
      }
    } else {
      // Search for the user
      const searchResults = await search.member(message, args.join(' '));

      if (searchResults.length === 1) user = searchResults[0].user;
      else if (searchResults.length === 0) user = args.length > 0 ? null : message.author;
      else return message.channel.send('Multiple users found. Please be more specific.');
    }
    // If no user is found
    if (!user) return message.channel.send('No users found.');

    logger.debug(`[Avatar Command] Retrieving avatar for user ${user.tag}`);

    // Create and send the embed
    const embed = new EmbedBuilder()
      .setTitle(`${user.displayName}'s Avatar`)
      .setURL(user.displayAvatarURL({ dynamic: true, size: 4096 }))
      .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }));

    message.channel.send({ embeds: [embed] })
      .then(() => logger.info(`[Avatar Command] Avatar sent for ${user.tag}`))
      .catch(error => {
        throw new Error(`[Avatar Command] Error sending avatar for ${user.tag}: ${error}`);
      });
  },
};

const { EmbedBuilder } = require('discord.js');
const logger = require('../../../components/logger.js');
const Search = require('../../../components/search.js');
const search = new Search();

module.exports = {
  name: 'banner',
  usage: 'banner <@user>|<user id>|<username>',
  category: 'Utility',
  allowDM: false,
  description: 'Send the banner of a provided user.',
  async execute(message, args) {
    let user;

    if (message.reference) {
      try {
        const repliedMessage = await message.channel.messages.fetch(message.reference.messageId);
        user = repliedMessage.author;
      } catch (error) {
        logger.error(`[Banner Command] Error fetching replied-to message: ${error}`);
        return message.channel.send('Error fetching the replied-to message.');
      }
    } else {
      const searchResults = await search.member(message, args.join(' '));
      switch (searchResults.length) {
        case 1:
          user = searchResults[0].user;
          break;
        case 0:
          if (args.length > 0) return message.channel.send('No users found.');

          break;
        default:
          return message.channel.send('Multiple users found. Please be more specific.');
      }
    }

    if (!user) return;

    if (!user.bannerURL) {
      logger.warn(`[Banner Command] User ${user.tag} does not have a banner in: ${message.guild.name}`);
      return message.channel.send('This user does not have a banner.');
    }

    logger.debug(`[Banner Command] Retrieving banner for user ${user.tag}`);

    const embed = new EmbedBuilder()
      .setTitle(`${user.displayName}'s Banner`)
      .setURL(user.bannerURL({ dynamic: true, size: 4096 }))
      .setImage(user.bannerURL({ dynamic: true, size: 4096 }));

    message.channel.send({ embeds: [embed] })
      .then(() => {
        logger.info(`[Banner Command] Banner sent successfully for user ${user.tag} in ${message.guild.name}`);
      })
      .catch(error => {
        logger.error(`[Banner Command] Error sending banner for user: ${user.tag}, in: ${message.guild.name}:\n${error}`);
      });
  },
};

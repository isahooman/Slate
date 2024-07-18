const { EmbedBuilder } = require('discord.js');
const { logger } = require('../../../components/loggerUtil.js');

module.exports = {
  name: 'banner',
  usage: 'banner <@user>|<user id>',
  category: 'Utility',
  allowDM: false,
  description: 'Send the banner of a provided user.',
  execute(message, args) {
    // Check if the message is a reply
    if (message.reference) {
      message.channel.messages.fetch(message.reference.messageId)
        .then(repliedMessage => {
        // Get the user who sent target message
          const user = repliedMessage.author;

          // Check if the user has a banner
          if (!user.bannerURL) {
            logger.warn(`[Banner Command] User ${user.tag} does not have a banner in: ${message.guild.name}`);
            return message.channel.send('This user does not have a banner.');
          }

          // Log the target user
          logger.debug(`[Banner Command] Retrieving banner for user ${user.tag}`);

          // Create an embed to display the banner.
          const embed = new EmbedBuilder()
            .setTitle(`${user.displayName}'s Banner`)
            .setURL(user.bannerURL({ dynamic: true, size: 4096 }))
            .setImage(user.bannerURL({ dynamic: true, size: 4096 }));

          // Send the banner embed.
          message.channel.send({ embeds: [embed] })
            .then(() => {
              logger.info(`[Banner Command] Banner sent successfully for user ${user.tag} in ${message.guild.name}`);
            })
            .catch(error => {
              logger.error(`[Banner Command] Error sending banner for user: ${user.tag}, in: ${message.guild.name}:\n${error}`);
            });
        })
        .catch(error => {
          logger.error(`[Banner Command] Error fetching replied-to message: ${error}`);
          message.channel.send('Error fetching the replied-to message.');
        });
    } else {
      // Retrieve the user from the arguments.
      let user = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;

      // If no user is provided, use the author
      if (!user) {
        user = message.author;
        logger.debug(`[Banner Command] Retrieving banner for user ${user.tag}`);
      } else {
        // Log the target user
        logger.debug(`[Banner Command] Retrieving banner for user ${user.tag}`);
      }

      // Create an embed to display the banner.
      const embed = new EmbedBuilder()
        .setTitle(`${user.displayName}'s Banner`)
        .setURL(user.bannerURL({ dynamic: true, size: 4096 }))
        .setImage(user.bannerURL({ dynamic: true, size: 4096 }));

      // Send the banner embed.
      message.channel.send({ embeds: [embed] }).then(() => {
        logger.info(`[Banner Command] Banner sent successfully for user ${user.tag} in ${message.guild.name}`);
      }).catch(error => {
        logger.error(`[Banner Command] Error sending banner for user: ${user.tag}, in: ${message.guild.name}:\n${error}`);
      });
    }
  },
};

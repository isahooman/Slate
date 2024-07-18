const { EmbedBuilder } = require('discord.js');
const { logger } = require('../../../components/loggerUtil.js');

module.exports = {
  name: 'avatar',
  usage: 'avatar <@user>|<user id>',
  category: 'Utility',
  aliases: ['av', 'pfp'],
  allowDM: false,
  description: 'Send the avatar of a user.',
  execute(message, args) {
    // Check if the message is a reply
    if (message.reference) {
      message.channel.messages.fetch(message.reference.messageId)
        .then(repliedMessage => {
          // Get the user who sent the replied-to message
          const user = repliedMessage.author;

          // Log the target user
          logger.debug(`[Avatar Command] Retrieving avatar for user ${user.tag}`);

          // Create an embed to display the avatar.
          const embed = new EmbedBuilder()
            .setTitle(`${user.displayName}'s Avatar`)
            .setURL(user.displayAvatarURL({ dynamic: true, size: 4096 }))
            .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }));

          // Send the avatar embed.
          message.channel.send({ embeds: [embed] }).then(() => {
            logger.info(`[Avatar Command] Avatar sent successfully for user ${user.tag} in ${message.guild.name}`);
          }).catch(error => {
            logger.error(`[Avatar Command] Error sending avatar for user: ${user.tag}, in: ${message.guild.name}:\n${error}`);
          });
        })
        .catch(error => {
          logger.error(`[Avatar Command] Error fetching replied-to message: ${error}`);
          message.channel.send('[Avatar Command] Error fetching the replied-to message.');
        });
    } else {
      // Retrieve the user from the arguments.
      let user = message.mentions.users.first() || message.guild.members.cache.get(args[0])?.user;

      // If no user is provided, use the author
      if (!user) {
        user = message.author;
        logger.debug(`[Avatar Command] Retrieving avatar for user ${user.tag}`);
      } else {
        // Log the target user
        logger.debug(`[Avatar Command] Retrieving avatar for user ${user.tag}`);
      }

      // Create an embed to display the avatar.
      const embed = new EmbedBuilder()
        .setTitle(`${user.displayName}'s Avatar`)
        .setURL(user.displayAvatarURL({ dynamic: true, size: 4096 }))
        .setImage(user.displayAvatarURL({ dynamic: true, size: 4096 }));

      // Send the avatar embed.
      message.channel.send({ embeds: [embed] }).then(() => {
        logger.info(`[Avatar Command] Avatar sent successfully for user ${user.tag} in ${message.guild.name}`);
      }).catch(error => {
        logger.error(`[Avatar Command] Error sending avatar for user: ${user.tag}, in: ${message.guild.name}:\n${error}`);
      });
    }
  },
};

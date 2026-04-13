const { EmbedBuilder } = require('discord.js');
const logger = require('#components/util/logger.js');

module.exports = {
  name: 'enlarge',
  usage: 'enlarge <emoji>',
  category: 'utility',
  allowDM: true,
  description: 'Enlarges an emoji.',
  execute(message, args) {
    // Check if the user provided an emoji.
    if (!args[0]) {
      logger.warn(`[Enlarge Command] No emoji provided for enlarge command in: ${message.guild ? message.guild.name : 'DM'}`);
      return message.channel.send('Please provide an emoji.');
    }

    // Get the emoji match from the message content.
    const emojiMatch = message.content.match(/<a?:(.*?):(\d+)>/);
    if (!emojiMatch) {
      logger.warn(`[Enlarge Command] Invalid or unicode emoji provided in: ${message.guild ? message.guild.name : 'DM'}`);
      return message.channel.send('Please provide a valid custom Discord emoji.');
    }

    // Extract the emoji name and ID from the match.
    const emojiName = emojiMatch[1];
    const emoji = emojiMatch[2];
    // Create emoji URL using the emoji ID.
    const url = `https://cdn.discordapp.com/emojis/${emoji}.png?size=256`;

    logger.debug(`[Enlarge Command] Enlarging emoji ${emoji} in ${message.guild ? message.guild.name : 'DM'}`);

    // Create an embed to display the enlarged emoji.
    const embed = new EmbedBuilder()
      .setTitle(`${emojiName}`)
      .setURL(url)
      .setImage(url);

    // Send the emoji embed
    message.channel.send({ embeds: [embed] })
      .then(() => {
        logger.debug(`[Enlarge Command] Emoji enlarged successfully in ${message.guild ? message.guild.name : 'DM'}`);
      })
      .catch(error => {
        throw new Error(`[Enlarge Command] Error sending enlarged emoji in ${message.guild ? message.guild.name : 'DM'}:\n${error}`);
      });
  },
};

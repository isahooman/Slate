const { EmbedBuilder } = require('discord.js');
const logger = require('../../../components/util/logger.js');

module.exports = {
  name: 'enlarge',
  usage: 'enlarge <emoji>',
  category: 'Utility',
  allowDM: true,
  description: 'Enlarges an emoji.',
  execute(message, args) {
    // Check if the user provided an emoji.
    if (!args[0]) {
      logger.warn(`[Enlarge Command] No emoji provided for enlarge command in: ${message.guild.name}`);
      return message.channel.send('Please provide an emoji.');
    }

    // Extract the emoji ID from the provided emoji.
    const emoji = args[0].replace(/<a?:(.*?):(\d+)>/g, '$2');
    // Create emoji URL using the emoji ID.
    const url = `https://cdn.discordapp.com/emojis/${emoji}.png?size=256`;
    // Get the emoji name from the message content.
    const emojiName = message.content.match(/<a?:(.*?):(\d+)>/)[1];

    logger.debug(`[Enlarge Command] Enlarging emoji ${emoji} in ${message.guild.name}`);

    // Create an embed to display the enlarged emoji.
    const embed = new EmbedBuilder()
      .setTitle(`${emojiName}`)
      .setURL(url)
      .setImage(url);

    // Send the emoji embed
    message.channel.send({ embeds: [embed] })
      .then(() => {
        logger.debug(`[Enlarge Command] Emoji enlarged successfully in ${message.guild.name}`);
      })
      .catch(error => {
        throw new Error(`[Enlarge Command] Error sending enlarged emoji in ${message.guild.name}:\n${error}`);
      });
  },
};

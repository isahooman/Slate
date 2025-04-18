const { EmbedBuilder } = require('discord.js');
const path = require('path');
const { readFile } = require('../../../components/core/fileHandler.js');
const logger = require('../../../components/util/logger.js');

module.exports = {
  name: 'suggest',
  usage: 'suggest <suggestion>',
  category: 'Utility',
  aliases: ['suggestion'],
  allowDM: true,
  description: 'Make a suggestion',
  async execute(message, args) {
    if (!args.length) {
      logger.warn(`[Suggest Command] No suggestion message provided`);
      return message.channel.send('Please provide a message for your suggestion.');
    }

    // Combine the arguments into a single string.
    const suggestMessage = args.join(' ');
    logger.debug(`[Suggest Command] Suggestion submitted by: ${message.author.username}, Message: ${suggestMessage}`);

    // Create an embed for the suggestion.
    const embed = new EmbedBuilder()
      .setColor('#91c2af')
      .setTitle('Suggestion')
      .addFields(
        { name: 'Server', value: message.guild ? `${message.guild.name} | ${message.guild.id}` : 'N/A' },
        { name: 'User', value: `<@${message.author.id}> | ${message.author.username}` },
        { name: 'Channel', value: `<#${message.channel.id}> | ID: ${message.channel.id}` },
        { name: 'Suggestion', value: suggestMessage },
      );

    try {
      const { suggestChannels } = await readFile(path.join(__dirname, '../../../config/config.json5'));

      if (Array.isArray(suggestChannels)) {
        // Send the suggestion to each channel and add reactions
        for (const channelId of suggestChannels) {
          const channel = message.client.channels.cache.get(channelId);
          if (channel) {
            logger.debug(`[Suggest Command] Sending suggestion to channel: ${channel.name} (${channel.id})`);
            const sentMessage = await channel.send({ embeds: [embed] }); // Send the embed and store the message object
            logger.info(`[Suggest Command] Suggestion sent to channel ${channel.name} (${channel.id})`);

            await sentMessage.react('✅');
            await sentMessage.react('❎');
          } else {
            throw new Error(`[Suggest Command] Invalid suggestion channel ID: ${channelId}`);
          }
        }

        // Send the confirmation message after all suggestions are sent
        logger.debug(`[Suggest Command] Suggestion submitted successfully`);
        message.channel.send('Your suggestion has been submitted. Thank you for your feedback!');
      } else {
        throw new Error('[Suggest Command] suggestChannels is not defined');
      }
    } catch (error) {
      throw new Error(`[Suggest Command] Error processing suggestion: ${error.message}`);
    }
  },
};

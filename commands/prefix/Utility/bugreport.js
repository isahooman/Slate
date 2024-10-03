const { EmbedBuilder } = require('discord.js');
const path = require('path');
const { readFile } = require('../../../components/fileHandler.js');
const logger = require('../../../components/logger.js');

module.exports = {
  name: 'bugreport',
  usage: 'bugreport <message>',
  category: 'Utility',
  aliases: ['reportbug', 'bug'],
  nsfw: false,
  allowDM: true,
  description: 'Report a bug',
  async execute(message, args) {
    if (!args.length) {
      logger.warn(`[Bug Report Command] No bug report message provided`);
      return message.channel.send('Please provide a message for your bug report.');
    }

    // Combine the arguments into a single string.
    const bugReportMessage = args.join(' ');
    logger.debug(`[Bug Report Command] Bug report submitted by: ${message.author.username}, Message: ${bugReportMessage}`);

    // Create an embed for the bug report.
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('Bug Report')
      .addFields(
        { name: 'Server', value: message.guild ? `${message.guild.name} | ${message.guild.id}` : 'N/A' },
        { name: 'User', value: `<@${message.author.id}> | ${message.author.username}` },
        { name: 'Channel', value: `<#${message.channel.id}> | ID: ${message.channel.id}` },
        { name: 'Message', value: bugReportMessage },
      );

    try {
      const { bugReportChannels } = await readFile(path.join(__dirname, '../../../config/config.json5'));

      if (Array.isArray(bugReportChannels)) {
        // Send the bug report to each channel
        for (const channelId of bugReportChannels) {
          const channel = message.client.channels.cache.get(channelId);
          if (channel) {
            logger.debug(`[Bug Report Command] Sending bug report to channel: ${channel.name} (${channel.id})`);
            await channel.send({ embeds: [embed] });
            logger.info(`[Bug Report Command] Bug report sent to channel ${channel.name} (${channel.id})`);
          } else {
            throw new Error(`[Bug Report Command] Invalid bug report channel ID: ${channelId}`);
          }
        }

        // Send the confirmation message after all reports are sent
        logger.debug(`[Bug Report Command] bug report completed from: ${message.author.tag}`);
        message.channel.send('Your bug report has been submitted. Thank you for your feedback!');
      } else {
        throw new Error('[Bug Report Command] bugReportChannels is not defined');
      }
    } catch (error) {
      throw new Error(`[Bug Report Command] Error processing bug report: ${error.message}`);
    }
  },
};

const logger = require('../../components/util/logger.js');
const { handlePrefixCommand } = require('../../components/commands/commandHandler.js');

module.exports = {
  name: 'messageUpdate',
  execute: async(oldMessage, newMessage, client) => {
    try {
      // Ignore bot messages
      if (newMessage.author.bot) {
        logger.debug(`Ignoring edited message from bot: ${newMessage.author.tag}`);
        return;
      }

      // Frame and log the message
      logger.message(`Processing edited message from: [${newMessage.author.tag}]:\n${frameMessage(newMessage)}`);

      // Send message to command handler
      await handlePrefixCommand(newMessage, client);
    } catch (error) {
      logger.error(`Error processing edited message: ${error.message}`);
    }
  },
};

/**
 * Creates a framed display of a Discord message with borders
 * @param {object} message - Discord Message
 * @returns {string} Formatted message with frame
 */
function frameMessage(message) {
  // Format message content
  let messageContent = message.content.split('\n').map(line => `│ ${line}`).join('\n');

  // Calculate the message width for border
  let maxLength = Math.max(...message.content.split('\n').map(line => line.length));
  const indicatorWidth = 15;

  // Check for attachments
  const hasAttachments = message.attachments.size > 0;
  const isOnlyAttachment = hasAttachments && message.content.trim() === '';
  if (hasAttachments) if (isOnlyAttachment) messageContent = `│ [attachment]`;
  else messageContent += `\n│ ${'[attachment]'.slice(0, indicatorWidth)}`;

  // Check for embeds
  const hasEmbeds = message.embeds.length > 0;
  const isOnlyEmbed = hasEmbeds && message.content.trim() === '';
  if (hasEmbeds) if (isOnlyEmbed && !hasAttachments) messageContent = `│ [embed]`;
  else messageContent += `\n│ ${'[embed]'.slice(0, indicatorWidth)}`;

  // Adjust maxLength for indicators
  maxLength = Math.max(...messageContent.split('\n').map(line => line.length));

  // Build the border
  const borderChar = '─';
  const borderLength = Math.max(maxLength + 2, indicatorWidth + 2);
  const border = borderChar.repeat(borderLength);

  return `╭${border}╮\n${messageContent}\n╰${border}╯`;
}

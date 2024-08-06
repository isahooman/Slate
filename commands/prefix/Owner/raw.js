const { logger } = require('../../../components/loggerUtil.js');
const util = require('util');

module.exports = {
  name: 'raw',
  usage: 'reply to a message with the command',
  category: 'Owner',
  allowDM: true,
  description: 'Gets the raw message data of the replied message',

  async execute(message) {
    try {
      // Check if the message is a reply
      if (!message.reference || !message.reference.messageId) {
        logger.warn(`[Raw Command]  used without replying to a message`);
        return message.reply('Please reply to a message.');
      }

      // Fetch the message replied to
      logger.debug(`[Raw Command] Fetching original message`);
      const originalMessage = await message.channel.messages.fetch(message.reference.messageId);
      logger.debug(`[Raw Command] Fetched original message successfully`);

      const rawContent = util.inspect(originalMessage, { depth: 1, maxArrayLength: null });
      const trimmedContent = rawContent.length > 1900 ? `${rawContent.substring(0, 1900)}...` : rawContent;

      // Reply with the raw message data
      await message.reply(`\`\`\`json\n${trimmedContent}\`\`\``);
      logger.debug('[Raw Command] Replied with raw information');
    } catch (error) {
      logger.error(`[Raw Command] Error executing: ${error.message}`);
      message.reply('Failed to retrieve the raw data of the message.');
    }
  },
};

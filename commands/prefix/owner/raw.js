const logger = require('../../../util/logger.js');
const util = require('util');

module.exports = {
  name: 'raw',
  description: 'Gets the raw message data of the replied message',

  async execute(message) {
    try {
      // Check if the message is a reply
      if (!message.reference || !message.reference.messageId) {
        logger.warn(`'raw' command used without replying to a message`, message.client, 'prefix', { commandName: 'raw', args: [], context: message });
        return message.reply('Please reply to a message.');
      }

      // Fetch the message replied to
      const originalMessage = await message.channel.messages.fetch(message.reference.messageId);
      logger.debug(`Fetched original message for 'raw' command`, message.client, 'prefix', { commandName: 'raw', args: [], context: message });

      const rawContent = util.inspect(originalMessage, { depth: 1, maxArrayLength: null });
      const trimmedContent = rawContent.length > 1900 ? `${rawContent.substring(0, 1900)}...` : rawContent;

      // Reply with the raw data
      await message.reply(`\`\`\`json\n${trimmedContent}\`\`\``);
      logger.info(`'raw' command executed`, message.client, 'prefix', { commandName: 'raw', args: [], context: message });
    } catch (error) {
      logger.error(`Error in 'raw' command: ${error.message}`, message.client, 'prefix', { commandName: 'raw', args: [], context: message });
      message.reply('Failed to retrieve the raw data of the message.');
    }
  },
};

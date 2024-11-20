const logger = require('../../../components/logger.js');

const prefixes = ['\'', '$', ',', '-', 't!', 't@', '!', '+', '_', ';', '.', '?', 's?', 'p!', 'r.', 'do.', 0,
  '-', '$$', '&&', 'a!', 'b!', 'c!', 'd!', 'e!', 'f!', 'g!', 'h!', 'i!', 'j!', 'k!', 'l!', 'm!', 'n!', 'o!', 'p!',
  'q!', 'r!', 's!', 't!', 'u!', 'v!', 'w!', 'x!', 'y!', 'z!', '/', '//', '\\', '=', '>', '->', '`', ', ', '|', '[',
  ']', 'ay!', 'r-', 'r+'];

module.exports = {
  name: 'botclear',
  usage: 'bc [number of messages]',
  category: 'Owner',
  aliases: ['bc'],
  allowDM: false,
  description: 'Clears bot messages',
  execute: async(message, args) => {
    try {
      // Get the number of messages to scan from args, default to 30
      const messagesToScan = parseInt(args[0]) || 30;
      logger.debug(`[BotClear Command] Messages to scan: ${messagesToScan}`);

      // Fetch the given number of messages
      const fetchedMessages = await message.channel.messages.fetch({ limit: messagesToScan });
      logger.debug(`[BotClear Command] Messages Fetched: ${fetchedMessages.size}`);

      // Filter bot messages
      const deletableMessages = fetchedMessages.filter(m =>
        m.author.bot || prefixes.some(prefix => m.content.startsWith(prefix)),
      );

      logger.debug(`[BotClear Command] Deletable messages: ${deletableMessages.size}`);

      // Bulk delete the filtered messages
      await message.channel.bulkDelete(deletableMessages, true);
      logger.debug(`[BotClear Command] Bulk deleted messages`);

      // Send a confirmation message and delete it after 3 seconds
      const confirmationMessage = await message.channel.send(`Cleared ${deletableMessages.size} messages.`);
      setTimeout(() => {
        confirmationMessage.delete().catch(e => {
          throw Error(`Error deleting confirmation message: ${e.message}`);
        });
      }, 5000);
    } catch (error) {
      throw Error(`Error executing bc command: ${error.message}`);
    }
  },
};

const path = require('path');
const { readFile } = require('../../../components/fileHandler.js');
const config = readFile(path.join(__dirname, '../../../config/config.json5'));
const { logger } = require('../../../components/loggerUtil.js');

const prefixes = ['\'', '$', ',', '-', 't!', 't@', '!', '+', '_', ';', '.', '?', 's?', 'p!', 'r.', 'do.', 0,
  '-', '$$', '&&', 'a!', 'b!', 'c!', 'd!', 'e!', 'f!', 'g!', 'h!', 'i!', 'j!', 'k!', 'l!', 'm!', 'n!', 'o!', 'p!',
  'q!', 'r!', 's!', 't!', 'u!', 'v!', 'w!', 'x!', 'y!', 'z!', '/', '//', '\\', '=', '>', '->', '`', ', ', '|', '[',
  ']', 'ay!', 'r-', 'r+'];

module.exports = {
  name: 'botclear',
  usage: 'bc <self/all>',
  category: 'Owner',
  aliases: ['bc'],
  allowDM: false,
  description: 'Clears bot messages',
  execute: async(message, args) => {
    // Check the arg provided
    const scope = args[0] || 'all';
    logger.debug(`[BotClear Command] Scope determined: ${scope}`);

    try {
      // Fetch the last 100 messages in the channel
      const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
      logger.debug(`[BotClear Command] Messages Fetched: ${fetchedMessages.size}`);

      let deletableMessages;

      // Filter messages to be deleted
      if (scope === 'self') deletableMessages = fetchedMessages.filter(msg =>
        msg.author.id === message.client.user.id || msg.content.startsWith(config.prefix),
      );
      else deletableMessages = fetchedMessages.filter(m =>
        m.author.bot || prefixes.some(prefix => m.content.startsWith(prefix)),
      );

      logger.debug(`[BotClear Command] Deletable messages: ${deletableMessages.size}`);

      // Filter messages to messages from the last 10 minutes
      const messagesToDelete = deletableMessages.filter(msg => msg.createdTimestamp > (Date.now() - 10 * 60 * 1000));
      logger.debug(`[BotClear Command] Messages to delete: ${messagesToDelete.size}`);

      // Bulk delete the filtered messages
      await message.channel.bulkDelete(messagesToDelete, true);
      logger.debug(`[BotClear Command] Bulk deleted messages`);

      // Send a confirmation message and delete it after 3 seconds
      const confirmationMessage = await message.channel.send(`Cleared ${messagesToDelete.size} messages.`);
      setTimeout(() => {
        confirmationMessage.delete().catch(e => logger.error(`[BotClear Command] Error deleting confirmation message: ${e.message}`));
      }, 3000);
    } catch (error) {
      logger.error(`[BotClear Command] Error executing bc command: ${error.message}`);
      await message.reply('An error occurred while deleting messages.');
    }
  },
};

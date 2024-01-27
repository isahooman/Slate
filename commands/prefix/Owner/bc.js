const logger = require('../../../components/logger');
const config = require('../../../config.json');

module.exports = {
  name: 'bc',
  usage: 'bc <self/all>',
  category: 'owner',
  description: 'Clears bot messages',

  // Function to execute the command
  execute: async (message, args) => {
    if (!message.guild) {
      logger.debug('Command used outside of a guild');
      return message.reply('This command can only be used in a guild.');
    }

    // Check the arg provided
    const scope = args[0] || 'all';
    logger.debug(`Scope determined: ${scope}`);

    try {
      // Fetch the last 100 messages in the channel
      const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
      logger.debug(`Fetched ${fetchedMessages.size} messages`);

      let deletableMessages;

      // Filter messages to be deleted
      if (scope === 'self') {
        deletableMessages = fetchedMessages.filter(msg =>
          msg.author.id === message.client.user.id || msg.content.startsWith(config.prefix)
        );
      } else {
        const prefixes = ['\'', '$', ',', '-', 't!', 't@', '!', '+', '_', ';', '.', '?', 's?', 'p!', 'r.', 'do.', 0, '-', '$$', '&&', 'a!', 'b!', 'c!', 'd!', 'e!', 'f!', 'g!', 'h!', 'i!', 'j!', 'k!', 'l!', 'm!', 'n!', 'o!', 'p!', 'q!', 'r!', 's!', 't!', 'u!', 'v!', 'w!', 'x!', 'y!', 'z!', '/', '//', '\\', '=', '>', '->', '`', ', ', '|', '[', ']', 'ay!', 'r-', 'r+'];
        deletableMessages = fetchedMessages.filter(m =>
          m.author.bot || prefixes.some(prefix => m.content.startsWith(prefix)),
        );
      }

      logger.debug(`Deletable messages filtered: ${deletableMessages.size}`);

      // Filter messages to messages from the last 7 minutes
      const messagesToDelete = deletableMessages.filter(msg => msg.createdTimestamp > (Date.now() - 420000));
      logger.debug(`Messages to delete: ${messagesToDelete.size}`);

      // Bulk delete the filtered messages
      await message.channel.bulkDelete(messagesToDelete, true);
      logger.debug(`Bulk deleted messages`);

      // Send a confirmation message and delete it after 3 seconds
      const confirmationMessage = await message.channel.send(`Cleared ${messagesToDelete.size} messages.`);
      setTimeout(() => {
        confirmationMessage.delete().catch(e => logger.error(`Error deleting confirmation message: ${e.message}`));
      }, 3000);
    } catch (error) {
      logger.error(`Error executing bc command: ${error.message}`);
      await message.reply('An error occurred while deleting messages.');
    }
  },
};

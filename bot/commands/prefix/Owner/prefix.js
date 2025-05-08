const configManager = require('../../../../components/configManager');
const { reloadEvent } = require('../../../components/core/loader');
const logger = require('../../../components/util/logger.js');

module.exports = {
  name: 'prefix',
  usage: 'prefix <new prefix>',
  category: 'Owner',
  aliases: ['setprefix'],
  allowDM: true,
  description: 'Changes the bot\'s prefix.',
  execute(message) {
    // Extract the new prefix from the message content.
    const newPrefix = message.content.split(' ')[1];

    // Check if a new prefix was provided.
    if (!newPrefix) {
      logger.warn('[Prefix Command] No new prefix provided.');
      return message.reply('Please provide a new prefix.');
    }

    logger.debug(`[Prefix Command] New prefix: ${newPrefix}`);

    try {
      logger.debug('[Prefix Command] Updating config with new prefix.');

      // Update the prefix in the config file.
      const updated = configManager.updateConfigValue('bot:config', 'prefix', newPrefix);

      if (!updated) throw new Error('Failed to update config');

      logger.debug('[Prefix Command] Prefix updated in config successfully.');

      // Reload the corresponding events
      reloadEvent(message.client, 'messageUpdate');
      reloadEvent(message.client, 'messageCreate');

      // Confirm the change to the user.
      logger.info(`[Prefix Command] Prefix changed to ${newPrefix} by user ${message.author.tag}`);
      message.reply(`Prefix changed to \`${newPrefix}\``);
    } catch (error) {
      throw new Error(`[Prefix Command] Error changing prefix: ${error.message}`);
    }
  },
};

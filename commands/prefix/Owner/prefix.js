const { readFile, writeFile } = require('../../../components/fileHandler.js');
const { reloadEvent } = require('../../../components/loader');
const { logger } = require('../../../components/loggerUtil.js');
const path = require('path');

module.exports = {
  name: 'prefix',
  usage: 'prefix <new prefix>',
  category: 'Owner',
  aliases: ['setprefix'],
  allowDM: true,
  description: 'Changes the bot\'s prefix.',
  async execute(message) {
    // Extract the new prefix from the message content.
    const newPrefix = message.content.split(' ')[1];

    // Check if a new prefix was provided.
    if (!newPrefix) {
      logger.debug('[Prefix Command] No new prefix provided.');
      return message.reply('Please provide a new prefix.');
    }

    logger.debug(`[Prefix Command] New prefix: ${newPrefix}`);

    try {
      logger.debug('[Prefix Command] Reading config file.');
      // Get the path to the config file.
      const configPath = path.join(__dirname, '..', '..', '..', 'config', 'config.json5');

      // Read the config file
      let config = await readFile(configPath);
      logger.debug('[Prefix Command] Config file read successfully.');

      // Update the prefix in the config
      logger.debug('[Prefix Command] Updating prefix in config.');
      config.prefix = newPrefix;
      logger.debug('[Prefix Command] Prefix updated in config.');

      // Write the updated config to the file.
      logger.debug('[Prefix Command] Writing updated config to file.');
      await writeFile(configPath, config);
      logger.debug('[Prefix Command] Config file written successfully.');

      // Reload the corresponding events
      reloadEvent(message.client, 'messageUpdate');
      reloadEvent(message.client, 'messageCreate');

      // Confirm completion
      logger.info(`[Prefix Command] Prefix changed to ${newPrefix} by user ${message.author.tag}`);
      message.reply(`[Prefix Command] Prefix changed to ${newPrefix}`);
    } catch (error) {
      // Log an error message.
      logger.error(`[Prefix Command] Error changing prefix: ${error.message}`);
    }
  },
};

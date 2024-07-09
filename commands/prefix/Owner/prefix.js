const { readJSON5, writeJSON5 } = require('../../../components/json5Parser.js');
const { reloadEvent } = require('../../../components/loader');
const logger = require('../../../components/logger.js');
const path = require('path');

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
      logger.debug('No new prefix provided.');
      return message.reply('Please provide a new prefix.');
    }

    logger.debug(`New prefix: ${newPrefix}`);

    try {
      logger.debug('Reading config file.');
      // Get the path to the config file.
      const configPath = path.join(__dirname, '..', '..', '..', 'config', 'config.json5');

      // Read the config file
      const config = readJSON5(configPath);
      logger.debug('Config file read successfully.');

      // Update the prefix in the config
      logger.debug('Updating prefix in config.');
      config.prefix = newPrefix;
      logger.debug('Prefix updated in config.');

      // Write the updated config to the file.
      logger.debug('Writing updated config to file.');
      writeJSON5(configPath, config);
      logger.debug('Config file written successfully.');

      // Reload the corresponding events
      reloadEvent(message.client, 'messageUpdate');
      reloadEvent(message.client, 'messageCreate');

      // Confirm completion
      logger.info(`Prefix changed to ${newPrefix} by user ${message.author.tag}`);
      message.reply(`Prefix changed to ${newPrefix}`);
    } catch (error) {
      // Log an error message.
      logger.error(`Error changing prefix: ${error.message}`);
    }
  },
};
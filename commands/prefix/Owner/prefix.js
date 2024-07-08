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
    const newPrefix = message.content.split(' ')[1];

    if (!newPrefix) {
      logger.debug('No new prefix provided.');
      return message.reply('Please provide a new prefix.');
    }

    logger.debug(`New prefix: ${newPrefix}`);

    try {
      logger.debug('Reading config file.');
      const configPath = path.join(__dirname, '..', '..', '..', 'config', 'config.json5');
      const config = readJSON5(configPath);
      logger.debug('Config file read successfully.');

      logger.debug('Updating prefix in config.');
      config.prefix = newPrefix;
      logger.debug('Prefix updated in config.');

      logger.debug('Writing updated config to file.');
      writeJSON5(configPath, config);
      logger.debug('Config file written successfully.');

      reloadEvent(message.client, 'messageUpdate');
      reloadEvent(message.client, 'messageCreate');

      logger.info(`Prefix changed to ${newPrefix} by user ${message.author.tag}`);
      message.reply(`Prefix changed to ${newPrefix}`);
    } catch (error) {
      logger.error(`Error changing prefix: ${error.message}`);
      message.reply('An error occurred while changing the prefix.');
    }
  },
};

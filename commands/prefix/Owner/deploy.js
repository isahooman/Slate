const logger = require('../../../util/logger.js');
const { clientId, guildId, token } = require('../../../util/config.json');
const fs = require('fs');
const { REST, Routes } = require('discord.js');

module.exports = {
  name: 'deploy',
  usage: 'deploy',
  category: 'Owner',
  description: 'Deploys global and guild-specific commands',
  async execute(message) {
    // Log the start of the deployment
    logger.debug(`Starting to deploy commands`);

    const globalCommands = [];
    const guildCommands = [];
    const globalCommandFiles = fs.readdirSync('./commands/slash/global').filter(file => file.endsWith('.js'));
    const devCommandFiles = fs.readdirSync('./commands/slash/dev').filter(file => file.endsWith('.js'));

    for (const file of globalCommandFiles) {
      const command = require(`../../../commands/slash/global/${file}`);
      globalCommands.push(command.data.toJSON());
      // Log global commands being prepared
      logger.debug(`Preparing global command: ${file}`);
    }

    for (const file of devCommandFiles) {
      const command = require(`../../../commands/slash/dev/${file}`);
      guildCommands.push(command.data.toJSON());
      // Log dev commands being prepared
      logger.debug(`Preparing dev command: ${file}`);
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      // Deploy global commands
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: globalCommands },
      );
      logger.info('Registered global slash commands!');

      // Deploy dev commands
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: guildCommands },
      );
      logger.info(`Registered guild slash commands for guildId: ${guildId}`);

      message.reply('Slash commands deployed successfully!');
    } catch (error) {
      logger.error(`Deployment error: ${error}`);
      message.reply('Failed to deploy slash commands.');
    }
  },
};

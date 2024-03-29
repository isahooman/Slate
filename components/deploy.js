const { clientId, token, guildId } = require('../config/config.json');
const { REST, Routes } = require('discord.js');
const logger = require('./logger.js');
const path = require('path');
const fs = require('fs');

/**
 * Load commands and their data
 * @param {directory} directory File Directory
 * @returns {JSON} Loads command data in JSON
 */
function loadCommandFiles(directory) {
  const fullPath = path.join(__dirname, '..', directory);
  const commandFiles = fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.js'));

  return commandFiles.map(file => {
    const command = require(path.join(fullPath, file));
    return command.data.toJSON();
  });
}

/**
 * Deploys slash commands
 * @param {import("discord.js").Client} client Discord Client
 */
async function deployCommands(client) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    // Load and deploy global commands
    const globalCommands = loadCommandFiles('commands/slash/global');
    if (globalCommands.length) {
      await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
      logger.info('Registered global slash commands!');
    } else {
      logger.debug('No global commands found to deploy.');
    }

    // Load and deploy dev commands to a specific guild
    const devCommands = loadCommandFiles('commands/slash/dev');
    if (devCommands.length) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: devCommands });
      logger.info(`Registered dev slash commands for: ${guildId}`);
    } else {
      logger.debug(`No dev commands found for guild: ${guildId}`);
    }
  } catch (error) {
    logger.error(`Error deploying commands: ${error.message}`, client);
  }
}

module.exports =
  {
    deployCommands,
  };


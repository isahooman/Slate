const path = require('path');
const { readJSON5 } = require('./json5Parser.js');
const { clientId, token, guildId } = readJSON5(path.join(__dirname, '../config/config.json5'));
const { readRecursive } = require('./fileHandler.js');
const { REST, Routes } = require('discord.js');
const { logger } = require('./loggerUtil.js');

/**
 * Load commands and their data
 * @param {directory} directory - File Directory
 * @returns {JSON} Loads command data in JSON
 * @author isahooman
 */
async function loadCommandFiles(directory) {
  const fullPath = path.join(__dirname, '..', directory);
  const commandFiles = await readRecursive(fullPath);

  return commandFiles.map(file => {
    const command = require(file);
    return command.data.toJSON();
  });
}

/**
 * Deploys slash commands
 * @param {client} client Discord Client
 * @author isahooman
 */
async function deployCommands(client) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    // Load and deploy global commands
    const globalCommands = await loadCommandFiles('commands/slash/global');
    if (globalCommands.length) {
      await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
      logger.info('Registered global slash commands!');
    } else {
      logger.debug('No global commands found to deploy.');
    }

    // Load and deploy dev commands to a specific guild
    const devCommands = await loadCommandFiles('commands/slash/dev');
    if (devCommands.length) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: devCommands });
      logger.info(`Registered dev slash commands for: ${guildId}`);
    } else {
      logger.debug(`No dev commands found for guild: ${guildId}`);
    }
  } catch (error) {
    logger.error(`Error deploying commands: ${error.message}\n${error.stack}}`, client);
  }
}

/**
 * Unregisters all slash commands
 * @author isahooman
 */
async function undeploy() {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    logger.info('Started unregistering global commands.');

    // Register an empty array for Global Commands effectively deleting all registered slash commands
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: [] },
    );
    logger.info('Successfully unregistered global commands.');

    logger.info('Started unregistering guild application commands.');

    // Register an empty array for Guild Commands effectively deleting all registered slash commands
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: [] },
    );

    logger.info('Successfully deleted all guild application commands.');
  } catch (error) {
    logger.error(`Error unregistering commands: ${error}`);
  }
}

module.exports =
{
  deployCommands,
  undeploy,
};

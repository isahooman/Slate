const path = require('path');
const { readJSON5 } = require('./json5Parser.js');
const { clientId, token, guildId } = readJSON5(path.join(__dirname, '../config/config.json5'));
const { readRecursive } = require('./fileHandler.js');
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const logger = require('./logger.js');

/**
 * Load commands and their data
 * @param {directory} directory - File Directory
 * @returns {Array} Array of command data.
 * @author isahooman
 */
async function loadCommandFiles(directory) {
  const fullPath = path.join(__dirname, '..', directory);
  const commandFiles = (await readRecursive(fullPath)).filter(file => path.extname(file).toLowerCase() === '.js');

  return commandFiles.map(file => {
    const command = require(file);
    let commandData;

    // Convert SlashCommandBuilder data to json if present, otherwise use raw data
    if (command.data instanceof SlashCommandBuilder) commandData = command.data.toJSON();
    else commandData = command.data;

    // If the command has the 'userInstall' parameter add the necessary data
    if (command.userInstall) {
      // Ignore userInstall for dev commands
      if (directory.includes('dev')) {
        logger.warn(`Command ${command.data.name} in ${directory} uses the [userInstall] option. Dev commands do not support user installs.`);
        return commandData;
      }
      commandData.integrationTypes = [0, 1];
      commandData.contexts = [0, 1, 2];
    }
    return commandData;
  });
}

/**
 * Deploys slash commands
 * @author isahooman
 */
async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    // Load and deploy global commands
    const globalCommands = await loadCommandFiles('commands/slash/global');
    if (globalCommands.length) {
      await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
      logger.info('Successfully registered global slash commands!');
    } else {
      logger.debug('No global commands found.');
    }

    // Load and deploy dev commands to the home guild
    const devCommands = await loadCommandFiles('commands/slash/dev');
    if (devCommands.length) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: devCommands });
      logger.info(`Successfully registered dev slash commands for: ${guildId}`);
    } else {
      logger.debug(`No dev commands found for guild: ${guildId}`);
    }
  } catch (error) {
    logger.error(`Error deploying commands: ${error.message}\n${error.stack}`);
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

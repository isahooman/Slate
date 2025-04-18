const path = require('path');
const { readRecursive } = require('../core/fileHandler.js');
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const logger = require('./logger.js');
const configManager = require('../../../components/configManager');

/**
 * Load commands and their data
 * @param {directory} directory - File Directory
 * @returns {Array} Array of command data.
 * @author isahooman
 */
async function loadCommandFiles(directory) {
  const fullPath = path.join(__dirname, '..', '..', directory);
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
  // Get configuration values
  const clientId = configManager.getConfigValue('config', 'clientId');
  const token = configManager.getConfigValue('config', 'token');
  const guildId = configManager.getConfigValue('config', 'guildId');

  // Validate required configuration
  if (!clientId || !token) {
    logger.error('Missing required configuration: clientId or token');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    // Load and deploy global commands
    const globalCommands = await loadCommandFiles('commands/slash/global');
    const uniqueGlobalCommands = Array.from(new Map(globalCommands.map(cmd => [cmd.name, cmd])).values());
    if (uniqueGlobalCommands.length) {
      uniqueGlobalCommands.forEach(command => logger.info(`Filtered duplicate global command: ${command.name}`));
      uniqueGlobalCommands.forEach(command => logger.info(`Deploying global command: ${command.name}`));
      await rest.put(Routes.applicationCommands(clientId), { body: uniqueGlobalCommands });
      logger.info('Successfully registered global slash commands!');
    } else {
      logger.debug('No global commands found.');
    }

    // Load and deploy dev commands to the home guild
    if (guildId) {
      const devCommands = await loadCommandFiles('commands/slash/dev');
      const uniqueDevCommands = Array.from(new Map(devCommands.map(cmd => [cmd.name, cmd])).values());
      if (uniqueDevCommands.length) {
        uniqueDevCommands.forEach(command => logger.info(`Filtered duplicate dev command: ${command.name}`));
        uniqueDevCommands.forEach(command => logger.info(`Deploying dev command: ${command.name}`));
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: uniqueDevCommands });
        logger.info(`Successfully registered dev slash commands for: ${guildId}`);
      } else {
        logger.debug(`No dev commands found for guild: ${guildId}`);
      }
    } else {
      logger.warn('No guildId specified in config. Skipping dev commands deployment.');
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
  // Get configuration values
  const clientId = configManager.getConfigValue('config', 'clientId');
  const token = configManager.getConfigValue('config', 'token');
  const guildId = configManager.getConfigValue('config', 'guildId');

  // Validate required configuration
  if (!clientId || !token) {
    logger.error('Missing required configuration: clientId or token');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    logger.info('Started unregistering global commands.');

    // Register an empty array for Global Commands effectively deleting all registered slash commands
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: [] },
    );
    logger.info('Successfully unregistered global commands.');

    if (guildId) {
      logger.info('Started unregistering guild application commands.');

      // Register an empty array for Guild Commands effectively deleting all registered slash commands
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: [] },
      );

      logger.info('Successfully deleted all guild application commands.');
    } else {
      logger.warn('No guildId specified in config. Skipping guild command undeployment.');
    }
  } catch (error) {
    logger.error(`Error unregistering commands: ${error}`);
  }
}

module.exports =
{
  deployCommands,
  undeploy,
};

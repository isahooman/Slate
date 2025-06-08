const { Collection } = require('discord.js');
const path = require('path');
const logger = require('../util/logger.js');
const { readRecursive } = require('../core/fileHandler.js');
const configManager = require('../../../components/configManager');

/**
 * Load all commands and ensure they exist in the config file
 * @param {client} client - Discord Client
 * @author isahooman
 */
async function loadCommands(client) {
  // Load commands configuration
  let commandsConfig = configManager.loadConfig('commands');

  // Initialize configuration objects if they don't exist
  if (!commandsConfig) commandsConfig = {};
  if (!commandsConfig.slash) commandsConfig.slash = {};
  if (!commandsConfig.prefix) commandsConfig.prefix = {};

  // Initialize collections
  client.slashCommands = new Collection();
  client.prefixCommands = new Collection();
  client.commandAliases = new Collection();

  // Load commands
  await loadSlashCommands(client, path.join(__dirname, '../../commands/slash'), commandsConfig);
  await loadPrefixCommands(client, path.join(__dirname, '../../commands/prefix'), commandsConfig);

  // Save any updates to the commands config
  configManager.saveConfig('commands', commandsConfig);
}

/**
 * Load slash commands
 * @param {client} client - Discord Client
 * @param {string} directory - The commands directory
 * @param {object} commandsConfig - Commands configuration object
 * @author isahooman
 */
async function loadSlashCommands(client, directory, commandsConfig) {
  const commandFiles = (await readRecursive(directory)).filter(file => path.extname(file) === '.js');
  for (const filePath of commandFiles) try {
    const command = require(filePath);
    command.filePath = filePath;
    client.slashCommands.set(command.data.name, command);
    if (!Object.hasOwn(commandsConfig.slash, command.data.name)) commandsConfig.slash[command.data.name] = true;
    logger.loading(`Loaded slash command: ${command.data.name}`);
  } catch (error) {
    throw new Error(`Error loading slash command at ${filePath}: ${error.message}`);
  }
}

/**
 * Load prefix commands.
 * @param {client} client - Discord Client
 * @param {string} directory - The commands directory.
 * @param {object} commandsConfig - Commands configuration object
 * @author isahooman
 */
async function loadPrefixCommands(client, directory, commandsConfig) {
  const commandFiles = (await readRecursive(directory)).filter(file => path.extname(file) === '.js');
  for (const filePath of commandFiles) try {
    const command = require(filePath);
    command.filePath = filePath;
    client.prefixCommands.set(command.name.toLowerCase(), command);

    if (!Object.hasOwn(commandsConfig.prefix, command.name.toLowerCase())) commandsConfig.prefix[command.name.toLowerCase()] = true;

    if (command.aliases && Array.isArray(command.aliases)) for (const alias of command.aliases) client.commandAliases.set(alias.toLowerCase(), command);
    logger.loading(`Loaded prefix command: ${command.name} (${command.aliases ? command.aliases.join(', ') : 'No aliases'})`);
  } catch (error) {
    throw new Error(`Error loading prefix command at ${filePath}: ${error.message}`);
  }
}

/**
 * Toggle the enabled state of a slash command.
 * @param {string} input - The command to toggle.
 * @param {client} client - Discord Client
 * @returns {object | null} - The command name and its new status.
 * @author isahooman
 */
function toggleSlashCommand(input, client) {
  const nearestCommand = findNearestCommand(input, client.slashCommands, 'slash');
  if (nearestCommand) {
    const commandName = nearestCommand.data.name;
    // Get current commands config
    const commandsConfig = configManager.loadConfig('commands');
    // Toggle command status
    let currentStatus = commandsConfig.slash[commandName];
    commandsConfig.slash[commandName] = currentStatus === undefined ? true : !currentStatus;
    // Save updated config
    configManager.saveConfig('commands', commandsConfig);
    return {
      name: commandName,
      enabled: commandsConfig.slash[commandName],
    };
  }
  return null;
}

/**
 * Toggles the enabled state of a prefix command.
 * @param {string} input - The command to toggle.
 * @param {client} client - Discord Client
 * @returns {object | null} - The command name and its new status.
 * @author isahooman
 */
function togglePrefixCommand(input, client) {
  const nearestCommand = findNearestCommand(input, client.prefixCommands, 'prefix');
  if (nearestCommand) {
    const commandName = nearestCommand.name.toLowerCase();
    // Get current commands config
    const commandsConfig = configManager.loadConfig('commands');
    // Toggle command status
    let currentStatus = commandsConfig.prefix[commandName];
    commandsConfig.prefix[commandName] = currentStatus === undefined ? true : !currentStatus;
    // Save updated config
    configManager.saveConfig('commands', commandsConfig);
    return {
      name: commandName,
      enabled: commandsConfig.prefix[commandName],
    };
  }
  return null;
}

/**
 * Checks the enabled state of a slash command.
 * @param {string} commandName - The name of the command.
 * @returns {boolean} - True if enabled, false otherwise.
 * @author isahooman
 */
function isSlashCommandEnabled(commandName) {
  return configManager.getConfigValue('commands', `slash.${commandName}`, true);
}

/**
 * Checks the enabled state of a prefix command.
 * @param {string} commandName - The name of the command.
 * @returns {boolean} - True if enabled, false otherwise.
 * @author isahooman
 */
function isPrefixCommandEnabled(commandName) {
  commandName = commandName.toLowerCase();
  return configManager.getConfigValue('commands', `prefix.${commandName}`, true);
}

/**
 * Finds the nearest command to the input.
 * @param {string} input - the input to search
 * @param {commands} commands - A collection of commands to search through.
 * @param {string} type - The type of command (e.g., 'slash' or 'prefix').
 * @returns {commands | null} - The nearest command found, or null if no matching command is found.
 * @author isahooman
 */
function findNearestCommand(input, commands, type) {
  let nearestCommand = null;
  let highestSimilarity = -1;

  if (type === 'prefix') commands.forEach(cmd => {
    if (cmd.aliases && cmd.aliases.includes(input)) nearestCommand = { ...cmd, type };
  });

  commands.forEach((cmd, cmdName) => {
    if (cmdName.startsWith(input)) {
      const similarity = cmdName.length - input.length;
      if (similarity >= 0 && (similarity < highestSimilarity || highestSimilarity === -1)) {
        highestSimilarity = similarity;
        nearestCommand = { ...cmd, type };
      }
    }
  });

  if (!nearestCommand && type === 'prefix') commands.forEach(cmd => {
    if (cmd.aliases && cmd.aliases.some(alias => alias.startsWith(input))) {
      const similarity = cmd.aliases.find(alias => alias.startsWith(input)).length - input.length;
      if (similarity >= 0 && (similarity < highestSimilarity || highestSimilarity === -1)) {
        highestSimilarity = similarity;
        nearestCommand = { ...cmd, type };
      }
    }
  });

  return nearestCommand;
}

/**
 * Reloads a specific command.
 * @param {client} client - Discord Client
 * @param {string} commandName - The name of the command to reload.
 * @param {string} commandType - The type of command to reload (slash or prefix).
 * @returns {boolean} - If reload was successful.
 * @author isahooman
 */
function reloadCommand(client, commandName, commandType) {
  if (commandType === 'slash') {
    const command = client.slashCommands.get(commandName);
    if (command) {
      delete require.cache[require.resolve(command.filePath)];
      const newCommand = require(command.filePath);
      newCommand.filePath = command.filePath;
      client.slashCommands.set(newCommand.data.name, newCommand);
      return true;
    }
  } else if (commandType === 'prefix') {
    const command = client.prefixCommands.get(commandName.toLowerCase());
    if (command) {
      delete require.cache[require.resolve(command.filePath)];
      const newCommand = require(command.filePath);
      newCommand.filePath = command.filePath;
      client.prefixCommands.set(newCommand.name.toLowerCase(), newCommand);
      if (newCommand.aliases && Array.isArray(newCommand.aliases)) newCommand.aliases.forEach(alias => {
        client.commandAliases.set(alias.toLowerCase(), newCommand);
      });
      return true;
    }
  }
  return false;
}

/**
 * Reloads all commands of the given type.
 * @param {client} client - Discord Client
 * @param {string} commandType - The type of commands to reload (slash or prefix).
 * @returns {boolean} - If reload was successful.
 * @author isahooman
 */
async function reloadAllCommands(client, commandType) {
  // Get current commands configuration
  const commandsConfig = configManager.loadConfig('commands');

  if (commandType === 'slash') {
    client.slashCommands.forEach(command => {
      delete require.cache[require.resolve(command.filePath)];
    });
    client.slashCommands.clear();
    await loadSlashCommands(client, path.join(__dirname, '..', '..', 'commands', 'slash'), commandsConfig);
    return true;
  } else if (commandType === 'prefix') {
    client.prefixCommands.forEach(command => {
      delete require.cache[require.resolve(command.filePath)];
    });
    client.prefixCommands.clear();
    client.commandAliases.clear();
    await loadPrefixCommands(client, path.join(__dirname, '..', '..', 'commands', 'prefix'), commandsConfig);
    return true;
  }
  return false;
}

module.exports = {
  loadCommands,
  toggleSlashCommand,
  togglePrefixCommand,
  reloadAllCommands,
  isPrefixCommandEnabled,
  isSlashCommandEnabled,
  findNearestCommand,
  reloadCommand,
};

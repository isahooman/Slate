const { Collection } = require('discord.js');
const path = require('path');
const ConfigFile = path.join(__dirname, '../../config/commands.json5');
const logger = require('../util/logger.js');
const { readFile, writeFile, readRecursive } = require('../core/fileHandler.js');

let commandsConfig;

/**
 * Load all commands and ensure they exist in the config file
 * @param {client} client - Discord Client
 * @author isahooman
 */
async function loadCommands(client) {
  try {
    commandsConfig = await readFile(ConfigFile);
  } catch {
    commandsConfig = { slash: {}, prefix: {} };
  }

  if (!commandsConfig.slash) commandsConfig.slash = {};
  if (!commandsConfig.prefix) commandsConfig.prefix = {};

  client.slashCommands = new Collection();
  client.prefixCommands = new Collection();
  client.commandAliases = new Collection();

  await loadSlashCommands(client, path.join(__dirname, '../../commands/slash'));
  await loadPrefixCommands(client, path.join(__dirname, '../../commands/prefix'));

  await writeFile(ConfigFile, commandsConfig);
}

/**
 * Load slash commands
 * @param {client} client - Discord client
 * @param {string} directory - The commands directory
 * @author isahooman
 */
async function loadSlashCommands(client, directory) {
  const commandFiles = (await readRecursive(directory)).filter(file => path.extname(file) === '.js');
  for (const filePath of commandFiles) try {
    const command = require(filePath);
    command.filePath = filePath;
    client.slashCommands.set(command.data.name, command);
    if (!Object.hasOwn(commandsConfig.slash, command.data.name)) commandsConfig.slash[command.data.name] = true;
  } catch (error) {
    logger.error(`Error loading slash command at ${filePath}: ${error.message}`);
  }
}

/**
 * Load prefix commands.
 * @param {client} client - Discord client
 * @param {string} directory - The commands directory.
 * @author isahooman
 */
async function loadPrefixCommands(client, directory) {
  const commandFiles = (await readRecursive(directory)).filter(file => path.extname(file) === '.js');
  for (const filePath of commandFiles) try {
    const command = require(filePath);
    command.filePath = filePath;
    client.prefixCommands.set(command.name.toLowerCase(), command);

    if (!Object.hasOwn(commandsConfig.prefix, command.name.toLowerCase())) commandsConfig.prefix[command.name.toLowerCase()] = true;

    if (command.aliases && Array.isArray(command.aliases)) for (const alias of command.aliases) client.commandAliases.set(alias.toLowerCase(), command);
  } catch (error) {
    logger.error(`Error loading prefix command at ${filePath}: ${error.message}`);
  }
}

/**
 * Toggle the enabled state of a slash command.
 * @param {string} input - The command to toggle.
 * @param {client} client - Discord client
 * @author isahooman
 */
function toggleSlashCommand(input, client) {
  const nearestCommand = findNearestCommand(input, client.slashCommands, 'slash');
  if (nearestCommand) {
    const commandName = nearestCommand.data.name;
    let currentStatus = commandsConfig.slash[commandName];
    commandsConfig.slash[commandName] = currentStatus === undefined ? true : !currentStatus;
    writeFile(ConfigFile, commandsConfig);
  }
}

/**
 * Toggles the enabled state of a prefix command.
 * @param {string} input - The command to toggle.
 * @param {client} client - Discord client
 * @author isahooman
 */
function togglePrefixCommand(input, client) {
  const nearestCommand = findNearestCommand(input, client.prefixCommands, 'prefix');
  if (nearestCommand) {
    const commandName = nearestCommand.name;
    let currentStatus = commandsConfig.prefix[commandName];
    commandsConfig.prefix[commandName] = currentStatus === undefined ? true : !currentStatus;
    writeFile(ConfigFile, commandsConfig);
  }
}

/**
 * Checks the enabled state of a slash command.
 * @param {string} commandName - The name of the command.
 * @returns {boolean} - True if enabled, false otherwise.
 * @author isahooman
 */
function isSlashCommandEnabled(commandName) {
  if (!Object.hasOwn(commandsConfig.slash, commandName)) {
    commandsConfig.slash[commandName] = true;
    writeFile(ConfigFile, commandsConfig);
  }
  return commandsConfig.slash[commandName];
}

/**
 * Checks the enabled state of a prefix command.
 * @param {string} commandName - The name of the command.
 * @returns {boolean} - True if enabled, false otherwise.
 * @author isahooman
 */
function isPrefixCommandEnabled(commandName) {
  commandName = commandName.toLowerCase();
  if (!Object.hasOwn(commandsConfig.prefix, commandName)) {
    commandsConfig.prefix[commandName] = true;
    writeFile(ConfigFile, commandsConfig);
  }
  return commandsConfig.prefix[commandName];
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
 * @param {client} client - Discord client
 * @param {string} commandName - The name of the command to reload.
 * @param {string} commandType - The type of command to reload (slash or prefix).
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
    }
  }
}

/**
 * Reloads all commands of the given type.
 * @param {client} client - Discord client
 * @param {string} commandType - The type of commands to reload (slash or prefix).
 * @author isahooman
 */
async function reloadAllCommands(client, commandType) {
  if (commandType === 'slash') {
    client.slashCommands.forEach(command => {
      delete require.cache[require.resolve(command.filePath)];
    });
    client.slashCommands.clear();
    await loadSlashCommands(client, path.join(__dirname, '..', '..', 'commands', 'slash'));
  } else if (commandType === 'prefix') {
    client.prefixCommands.forEach(command => {
      delete require.cache[require.resolve(command.filePath)];
    });
    client.prefixCommands.clear();
    client.commandAliases.clear();
    await loadPrefixCommands(client, path.join(__dirname, '..', '..', 'commands', 'prefix'));
  }
}

module.exports =
{
  loadCommands,
  toggleSlashCommand,
  togglePrefixCommand,
  reloadAllCommands,
  isPrefixCommandEnabled,
  isSlashCommandEnabled,
  findNearestCommand,
  reloadCommand,
};

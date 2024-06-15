const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('./logger.js');
const { readJSON5, writeJSON5 } = require('./json5Parser.js');
const ConfigFile = path.join(__dirname, '../config/commands.json5');
const commandsConfig = readJSON5(ConfigFile);

/**
 * Load all commands and ensure they exist in the config file
 * @param {client} client Discord Client
 */
function loadCommands(client) {
  logger.debug('Starting command loading process...');
  if (!commandsConfig.slash) commandsConfig.slash = {};
  if (!commandsConfig.prefix) commandsConfig.prefix = {};

  client.slashCommands = new Collection();
  client.prefixCommands = new Collection();
  client.commandAliases = new Collection();

  logger.debug('Loading slash commands...');
  loadSlashCommands(client, path.join(__dirname, '../commands/slash'));
  logger.debug('Loading prefix commands...');
  loadPrefixCommands(client, path.join(__dirname, '../commands/prefix'));

  logger.debug('Saving command configuration...');
  writeJSON5(ConfigFile, commandsConfig);
  logger.debug('Command loading complete.');
}

/**
 * Load slash commands
 * @param {client} client - Discord client
 * @param {string} directory - The commands directory
 */
function loadSlashCommands(client, directory) {
  logger.debug(`Loading slash commands from ${path.relative(process.cwd(), directory)}...`);
  const commandFiles = readCommands(directory);
  for (const fileData of commandFiles) try {
    const command = require(fileData.path);
    client.slashCommands.set(command.data.name, command);

    // Only set to true if the command doesn't exist in the config
    if (!Object.hasOwn(commandsConfig.slash, command.data.name)) commandsConfig.slash[command.data.name] = true;

    logger.loading(`Loaded slash command: ${command.data.name}`);
  } catch (error) {
    logger.error(`Error loading slash command at ${fileData.path}: ${error.message}`);
  }

  logger.info('All slash commands loaded successfully.');
}

/**
 * Load prefix commands.
 * @param {client} client - Discord client
 * @param {string} directory - The commands directory.
 */
function loadPrefixCommands(client, directory) {
  logger.debug(`Loading prefix commands from ${directory}...`);
  const commandFiles = readCommands(directory);
  for (const fileData of commandFiles) try {
    const command = require(fileData.path);
    client.prefixCommands.set(command.name.toLowerCase(), command);

    // Only set to true if the command doesn't exist in the config
    if (!Object.hasOwn(commandsConfig.prefix, command.name.toLowerCase())) commandsConfig.prefix[command.name.toLowerCase()] = true;

    if (command.aliases && Array.isArray(command.aliases)) for (const alias of command.aliases) {
      client.commandAliases.set(alias.toLowerCase(), command);
      logger.debug(`Registered alias for prefix command: ${alias} -> ${command.name}`);
    }

    logger.loading(`Loaded prefix command: ${command.name}`);
  } catch (error) {
    logger.error(`Error loading prefix command at ${fileData.path}: ${error.message}`);
  }

  logger.info('All prefix commands loaded successfully.');
}

/**
 * Recursively Read Command Directories
 * @param {string} directory - A given directory
 * @returns {Array} - An array of files
 */
function readCommands(directory) {
  const files = fs.readdirSync(directory);
  let commandFiles = [];

  for (const file of files) {
    const filepath = path.join(directory, file);
    logger.debug(`Checking file: ${path.relative(process.cwd(), filepath)}`);

    if (fs.statSync(filepath).isDirectory()) {
      logger.debug(`Found subdirectory: ${path.relative(process.cwd(), filepath)}`);
      commandFiles = commandFiles.concat(readCommands(filepath));
    } else if (file.endsWith('.js')) {
      logger.debug(`Found command file: ${path.relative(process.cwd(), filepath)}`);
      commandFiles.push({ path: filepath, directory });
    } else if (!file.endsWith('.md')) {
      logger.warn(`Invalid file found in commands directory: ${file}`);
    }
  }

  logger.debug(`Found ${commandFiles.length} command files in ${path.relative(process.cwd(), directory)}`);
  return commandFiles;
}

/**
 * Reloads all commands of the given type.
 * @param {client} client - Discord client
 * @param {string} commandType - The type of commands to reload (slash or prefix).
 */
function reloadAllCommands(client, commandType) {
  logger.debug(`Reloading all ${commandType} commands...`);
  const baseDir = path.join(__dirname, '..', 'commands', commandType);
  const commandFiles = readCommands(baseDir);

  commandFiles.forEach(fileData => {
    const commandFilePath = fileData.path;
    delete require.cache[require.resolve(commandFilePath)];
    try {
      logger.debug(`Reloading ${commandFilePath}...`);
      const command = require(commandFilePath);
      const commandKey = commandType === 'slash' ? command.data.name : command.name.toLowerCase();
      if (commandType === 'slash') {
        client.slashCommands.set(commandKey, command);
        logger.debug(`Reloaded Slash Command: ${command.data.name}`);
      } else {
        client.prefixCommands.set(commandKey, command);
        logger.debug(`Reloaded Prefix Command: ${command.name}`);
        if (command.aliases && Array.isArray(command.aliases)) command.aliases.forEach(alias => {
          client.commandAliases.set(alias.toLowerCase(), command);
          logger.debug(`Re-registered alias for prefix command: ${alias} -> ${command.name}`);
        });
      }
    } catch (error) {
      logger.error(`Error reloading ${commandType} command at ${commandFilePath}: ${error.message}`);
    }
  });
  logger.info(`All ${commandType} commands reloaded successfully.`);
}

/**
 * Toggle the enabled state of a slash command.
 * @param {string} input - The command to toggle.
 * @param {client} client - Discord client
 */
function toggleSlashCommand(input, client) {
  logger.debug(`Attempting to toggle slash command: ${input}`);
  const nearestCommand = findNearestCommand(input, client.slashCommands, 'slash');
  if (nearestCommand) {
    const commandName = nearestCommand.data.name;
    let currentStatus = commandsConfig.slash[commandName];
    commandsConfig.slash[commandName] = currentStatus === undefined ? true : !currentStatus;
    const newStatus = commandsConfig.slash[commandName];
    logger.debug(`Toggled command ${commandName} from ${currentStatus} to ${newStatus}`);
    writeJSON5(ConfigFile, commandsConfig);
    logger.info(`Toggled slash command ${commandName}: ${newStatus}`);
  } else {
    logger.warn(`No slash command found with name '${input}'.`);
  }
}

/**
 * Toggles the enabled state of a prefix command.
 * @param {string} input - The command to toggle.
 * @param {client} client - Discord client
 */
function togglePrefixCommand(input, client) {
  logger.debug(`Attempting to toggle prefix command: ${input}`);
  const nearestCommand = findNearestCommand(input, client.prefixCommands, 'prefix');
  if (nearestCommand) {
    const commandName = nearestCommand.name;
    let currentStatus = commandsConfig.prefix[commandName];
    commandsConfig.prefix[commandName] = currentStatus === undefined ? true : !currentStatus;
    const newStatus = commandsConfig.prefix[commandName];
    logger.debug(`Toggled command ${commandName} from ${currentStatus} to ${newStatus}`);
    writeJSON5(ConfigFile, commandsConfig);
    logger.info(`Toggled prefix command ${commandName}: ${newStatus}`);
  } else {
    logger.warn(`No prefix command found with name '${input}'.`);
  }
}

/**
 * Checks the enabled state of a slash command.
 * @param {string} commandName - The name of the command.
 * @returns {boolean} - True if enabled, false otherwise.
 */
function isSlashCommandEnabled(commandName) {
  logger.debug(`Checking if slash command ${commandName} is enabled...`);
  if (!Object.hasOwn(commandsConfig.slash, commandName)) {
    logger.debug(`Slash command ${commandName} not found in configuration, adding and enabling it...`);
    commandsConfig.slash[commandName] = true;
    writeJSON5(ConfigFile, commandsConfig);
  }

  const isEnabled = commandsConfig.slash[commandName];
  logger.debug(`Slash command ${commandName} is ${isEnabled ? 'enabled' : 'disabled'}.`);
  return isEnabled;
}

/**
 * Checks the enabled state of a prefix command.
 * @param {string} commandName - The name of the command.
 * @returns {boolean} - True if enabled, false otherwise.
 */
function isPrefixCommandEnabled(commandName) {
  commandName = commandName.toLowerCase();
  logger.debug(`Checking if prefix command ${commandName} is enabled...`);
  if (!Object.hasOwn(commandsConfig.prefix, commandName)) {
    logger.debug(`Prefix command ${commandName} not found in configuration, adding and enabling it...`);
    commandsConfig.prefix[commandName] = true;
    writeJSON5(ConfigFile, commandsConfig);
  }

  const isEnabled = commandsConfig.prefix[commandName];
  logger.debug(`Prefix command ${commandName} is ${isEnabled ? 'enabled' : 'disabled'}.`);
  return isEnabled;
}

/**
 * Finds the nearest command to the input.
 * @param {string} input - the input to search
 * @param {commands} commands - A collection of commands to search through.
 * @param {string} type - The type of command (e.g., 'slash' or 'prefix').
 * @returns {commands | null} - The nearest command found, or null if no matching command is found.
 */
function findNearestCommand(input, commands, type) {
  let nearestCommand = null;
  let highestSimilarity = -1;

  commands.forEach((cmd, cmdName) => {
    if (cmdName.startsWith(input)) {
      const similarity = cmdName.length - input.length;
      if (similarity >= 0 && (similarity < highestSimilarity || highestSimilarity === -1)) {
        highestSimilarity = similarity;
        nearestCommand = { ...cmd, type };
      }
    }
  });

  // Search for aliases if no exact match is found
  if (!nearestCommand && type === 'prefix') commands.forEach((cmd, cmdName) => {
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

module.exports =
{
  loadCommands,
  toggleSlashCommand,
  togglePrefixCommand,
  reloadAllCommands,
  isPrefixCommandEnabled,
  isSlashCommandEnabled,
  findNearestCommand,
};

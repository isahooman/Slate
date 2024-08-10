const { Collection } = require('discord.js');
const path = require('path');
const ConfigFile = path.join(__dirname, '../config/commands.json5');
const { logger } = require('./loggerUtil.js');
const { readFile, writeFile, readRecursive } = require('./fileHandler.js');

let commandsConfig;

/**
 * Load all commands and ensure they exist in the config file
 * @param {client} client - Discord Client
 * @author isahooman
 */
async function loadCommands(client) {
  logger.debug('Starting command loading process...');
  try {
    commandsConfig = await readFile(ConfigFile);
    logger.debug(`Command config file read successfully: ${ConfigFile}`);
  } catch (error) {
    logger.error(`Error reading command config file: ${error.message}`);
    commandsConfig = { slash: {}, prefix: {} };
  }

  if (!commandsConfig.slash) commandsConfig.slash = {};
  logger.debug('Slash command config initialized.');
  if (!commandsConfig.prefix) commandsConfig.prefix = {};
  logger.debug('Prefix command config initialized.');

  client.slashCommands = new Collection();
  logger.debug('Slash command collection initialized.');
  client.prefixCommands = new Collection();
  logger.debug('Prefix command collection initialized.');
  client.commandAliases = new Collection();
  logger.debug('Command alias collection initialized.');

  logger.debug('Loading slash commands...');
  await loadSlashCommands(client, path.join(__dirname, '../commands/slash'));
  logger.debug('Loading prefix commands...');
  await loadPrefixCommands(client, path.join(__dirname, '../commands/prefix'));

  logger.debug('Saving command configuration...');
  await writeFile(ConfigFile, commandsConfig);
  logger.debug('Command loading complete.');
}

/**
 * Load slash commands
 * @param {client} client - Discord client
 * @param {string} directory - The commands directory
 * @author isahooman
 */
async function loadSlashCommands(client, directory) {
  logger.debug(`Loading slash commands from ${path.relative(process.cwd(), directory)}...`);
  // Use readRecursive to get all command files
  const commandFiles = (await readRecursive(directory)).filter(file => path.extname(file) === '.js');
  logger.debug(`Found ${commandFiles.length} slash command files.`);
  for (const filePath of commandFiles) try {
    const command = require(filePath);
    command.filePath = filePath;
    client.slashCommands.set(command.data.name, command);
    logger.debug(`Slash command loaded: ${command.data.name}`);

    // Only set to true if the command doesn't exist in the config
    if (!Object.hasOwn(commandsConfig.slash, command.data.name)) {
      commandsConfig.slash[command.data.name] = true;
      logger.debug(`Slash command added to config: ${command.data.name}`);
    }
  } catch (error) {
    logger.error(`Error loading slash command at ${filePath}: ${error.message}`);
  }

  logger.info('All slash commands loaded successfully.');
}

/**
 * Load prefix commands.
 * @param {client} client - Discord client
 * @param {string} directory - The commands directory.
 * @author isahooman
 */
async function loadPrefixCommands(client, directory) {
  logger.debug(`Loading prefix commands from ${directory}...`);
  // Use readRecursive to get all command files
  const commandFiles = (await readRecursive(directory)).filter(file => path.extname(file) === '.js');
  logger.debug(`Found ${commandFiles.length} prefix command files.`);
  for (const filePath of commandFiles) try {
    const command = require(filePath);
    command.filePath = filePath;
    client.prefixCommands.set(command.name.toLowerCase(), command);
    logger.debug(`Prefix command loaded: ${command.name}`);

    // Only set to true if the command doesn't exist in the config
    if (!Object.hasOwn(commandsConfig.prefix, command.name.toLowerCase())) {
      commandsConfig.prefix[command.name.toLowerCase()] = true;
      logger.debug(`Prefix command added to config: ${command.name}`);
    }

    if (command.aliases && Array.isArray(command.aliases)) for (const alias of command.aliases) {
      client.commandAliases.set(alias.toLowerCase(), command);
      logger.debug(`Registered alias for prefix command: ${alias} -> ${command.name}`);
    }
  } catch (error) {
    logger.error(`Error loading prefix command at ${filePath}: ${error.message}`);
  }

  logger.info('All prefix commands loaded successfully.');
}

/**
 * Toggle the enabled state of a slash command.
 * @param {string} input - The command to toggle.
 * @param {client} client - Discord client
 * @author isahooman
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
    writeFile(ConfigFile, commandsConfig);
    logger.info(`Toggled slash command ${commandName}: ${newStatus}`);
  } else {
    logger.warn(`No slash command found with name '${input}'.`);
  }
}

/**
 * Toggles the enabled state of a prefix command.
 * @param {string} input - The command to toggle.
 * @param {client} client - Discord client
 * @author isahooman
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
    writeFile(ConfigFile, commandsConfig);
    logger.info(`Toggled prefix command ${commandName}: ${newStatus}`);
  } else {
    logger.warn(`No prefix command found with name '${input}'.`);
  }
}

/**
 * Checks the enabled state of a slash command.
 * @param {string} commandName - The name of the command.
 * @returns {boolean} - True if enabled, false otherwise.
 * @author isahooman
 */
function isSlashCommandEnabled(commandName) {
  logger.debug(`Checking if slash command ${commandName} is enabled...`);
  if (!Object.hasOwn(commandsConfig.slash, commandName)) {
    logger.debug(`Slash command ${commandName} not found in configuration, adding and enabling it...`);
    commandsConfig.slash[commandName] = true;
    writeFile(ConfigFile, commandsConfig);
  }

  const isEnabled = commandsConfig.slash[commandName];
  logger.debug(`Slash command ${commandName} is ${isEnabled ? 'enabled' : 'disabled'}.`);
  return isEnabled;
}

/**
 * Checks the enabled state of a prefix command.
 * @param {string} commandName - The name of the command.
 * @returns {boolean} - True if enabled, false otherwise.
 * @author isahooman
 */
function isPrefixCommandEnabled(commandName) {
  commandName = commandName.toLowerCase();
  logger.debug(`Checking if prefix command ${commandName} is enabled...`);
  if (!Object.hasOwn(commandsConfig.prefix, commandName)) {
    logger.debug(`Prefix command ${commandName} not found in configuration, adding and enabling it...`);
    commandsConfig.prefix[commandName] = true;
    writeFile(ConfigFile, commandsConfig);
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
 * @author isahooman
 */
function findNearestCommand(input, commands, type) {
  let nearestCommand = null;
  let highestSimilarity = -1;

  logger.debug(`Searching for command input: ${input}`);

  // Search for exact alias matches first
  if (type === 'prefix') {
    logger.debug('Searching for exact alias matches in prefix commands.');
    commands.forEach(cmd => {
      if (cmd.aliases && cmd.aliases.includes(input)) {
        nearestCommand = { ...cmd, type };
        logger.debug(`Found alias match for prefix command: ${input} -> ${cmd.name}`);
      }
    });
  }

  // If no exact alias match, search for nearest command name
  logger.debug('Searching for nearest command name matches.');
  commands.forEach((cmd, cmdName) => {
    if (cmdName.startsWith(input)) {
      const similarity = cmdName.length - input.length;
      if (similarity >= 0 && (similarity < highestSimilarity || highestSimilarity === -1)) {
        highestSimilarity = similarity;
        nearestCommand = { ...cmd, type };
        logger.debug(`Found command name match for ${type} command: ${input} -> ${cmdName}`);
      }
    }
  });

  // Search for nearest alias if no command name match is found
  if (!nearestCommand && type === 'prefix') {
    logger.debug('No command name matches found, searching for nearest alias.');
    commands.forEach(cmd => {
      if (cmd.aliases && cmd.aliases.some(alias => alias.startsWith(input))) {
        const similarity = cmd.aliases.find(alias => alias.startsWith(input)).length - input.length;
        if (similarity >= 0 && (similarity < highestSimilarity || highestSimilarity === -1)) {
          highestSimilarity = similarity;
          nearestCommand = { ...cmd, type };
          logger.debug(`Found alias match for command: ${input} -> ${cmd.aliases.find(alias => alias.startsWith(input))}`);
        }
      }
    });
  }
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
  logger.debug(`Reloading ${commandType} command: ${commandName}`);
  if (commandType === 'slash') {
    const command = client.slashCommands.get(commandName);
    if (command) {
      // Clear the cache for the command file
      delete require.cache[require.resolve(command.filePath)]; // Use command.filePath here
      // Reload the command from the file
      const newCommand = require(command.filePath); // Use command.filePath here
      // Update the command in the collection
      newCommand.filePath = command.filePath; // Re-add the filePath property
      client.slashCommands.set(newCommand.data.name, newCommand);
      logger.info(`Reloaded slash command: ${commandName}`);
    } else {
      logger.warn(`Slash command not found: ${commandName}`);
    }
  } else if (commandType === 'prefix') {
    const command = client.prefixCommands.get(commandName.toLowerCase());
    if (command) {
      // Clear the cache for the command file
      delete require.cache[require.resolve(command.filePath)]; // Use command.filePath here
      // Reload the command from the file
      const newCommand = require(command.filePath); // Use command.filePath here
      // Update the command in the collection
      newCommand.filePath = command.filePath; // Re-add the filePath property
      client.prefixCommands.set(newCommand.name.toLowerCase(), newCommand);
      // Update aliases if they exist
      if (newCommand.aliases && Array.isArray(newCommand.aliases)) newCommand.aliases.forEach(alias => {
        client.commandAliases.set(alias.toLowerCase(), newCommand);
      });
      logger.info(`Reloaded prefix command: ${commandName}`);
    } else {
      logger.warn(`Prefix command not found: ${commandName}`);
    }
  } else {
    logger.warn(`Invalid command type: ${commandType}`);
  }
}

/**
 * Reloads all commands of the given type.
 * @param {client} client - Discord client
 * @param {string} commandType - The type of commands to reload (slash or prefix).
 * @author isahooman
 */
async function reloadAllCommands(client, commandType) {
  logger.debug(`Reloading all ${commandType} commands...`);
  if (commandType === 'slash') {
    client.slashCommands.forEach(command => {
      delete require.cache[require.resolve(command.filePath)];
    });
    client.slashCommands.clear();
    logger.info('Slash command collection cleared.');
    await loadSlashCommands(client, path.join(__dirname, '..', 'commands', 'slash'));
  } else if (commandType === 'prefix') {
    client.prefixCommands.forEach(command => {
      delete require.cache[require.resolve(command.filePath)];
    });
    client.prefixCommands.clear();
    logger.info('Prefix command collection cleared.');
    client.commandAliases.clear();
    logger.info('Command alias collection cleared.');
    await loadPrefixCommands(client, path.join(__dirname, '..', 'commands', 'prefix'));
  } else {
    logger.warn(`Invalid command type: ${commandType}`);
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

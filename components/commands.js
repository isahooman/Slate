const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('./logger.js');
const ConfigFile = path.join(__dirname, '../config/commands.json');
const commandsConfig = require(ConfigFile);

/**
 * Load all commands and ensure they exist in the config file
 * @param {import("discord.js").Client} client Discord Client
 */
function loadCommands(client) {
  client.slashCommands = new Collection();
  client.prefixCommands = new Collection();
  client.commandAliases = new Collection();

  loadSlashCommands(client, path.join(__dirname, '../commands/slash'));
  loadPrefixCommands(client, path.join(__dirname, '../commands/prefix'));

  // Save any changes to commands.json
  fs.writeFileSync(ConfigFile, JSON.stringify(commandsConfig, null, 2));
}

/**
 *
 * @param client
 * @param directory
 */
function loadSlashCommands(client, directory) {
  const commandFiles = readCommands(directory);
  for (const fileData of commandFiles) try {
    const command = require(fileData.path);
    client.slashCommands.set(command.data.name, command);
    // Ensure command is in commandsConfig
    if (commandsConfig.slash[command.data.name] === undefined) commandsConfig.slash[command.data.name] = true; // Enable by default

    logger.loading(`Slash Command Loaded: ${command.data.name}`);
  } catch (error) {
    logger.error(`Error loading slash command at ${fileData.path}: ${error.message}`);
  }
}

/**
 *
 * @param client
 * @param directory
 */
function loadPrefixCommands(client, directory) {
  const commandFiles = readCommands(directory);
  for (const fileData of commandFiles) try {
    const command = require(fileData.path);
    client.prefixCommands.set(command.name.toLowerCase(), command);
    // Ensure command is in commandsConfig
    if (commandsConfig.prefix[command.name.toLowerCase()] === undefined) commandsConfig.prefix[command.name.toLowerCase()] = true; // Enable by default

    // Handle command aliases
    if (command.aliases && Array.isArray(command.aliases)) for (const alias of command.aliases) client.commandAliases.set(alias.toLowerCase(), command);


    logger.loading(`Prefix Command Loaded: ${command.name}`);
  } catch (error) {
    logger.error(`Error loading prefix command at ${fileData.path}: ${error.message}`);
  }
}

/**
 * Toggle the enabled state of a slash command
 * @param {string} commandName Name of the command to toggle
 */
function toggleSlashCommand(commandName) {
  if (Object.prototype.hasOwnProperty.call(commandsConfig.slash, commandName)) {
    commandsConfig.slash[commandName] = !commandsConfig.slash[commandName];
    fs.writeFileSync(ConfigFile, JSON.stringify(commandsConfig, null, 2));
    logger.info(`Toggled slash command ${commandName}: ${commandsConfig.slash[commandName]}`);
  } else {
    logger.error(`Slash command ${commandName} not found.`);
  }
}

/**
 * Toggle the enabled state of a prefix command
 * @param {string} commandName Name of the command to toggle
 */
function togglePrefixCommand(commandName) {
  commandName = commandName.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(commandsConfig.prefix, commandName)) {
    commandsConfig.prefix[commandName] = !commandsConfig.prefix[commandName];
    fs.writeFileSync(ConfigFile, JSON.stringify(commandsConfig, null, 2));
    logger.info(`Toggled prefix command ${commandName}: ${commandsConfig.prefix[commandName]}`);
  } else {
    logger.error(`Prefix command ${commandName} not found.`);
  }
}

/**
 * Recursively Read Command Directories
 * @param {string} directory A given directory
 * @returns {Array} An array of files
 */
function readCommands(directory) {
  const files = fs.readdirSync(directory);
  let commandFiles = [];
  for (const file of files) {
    const filepath = path.join(directory, file);
    if (fs.statSync(filepath).isDirectory()) commandFiles = commandFiles.concat(readCommands(filepath));
    else if (file.endsWith('.js')) commandFiles.push({ path: filepath, directory });
    else if (!file.endsWith('.md')) logger.error(`Invalid file found in commands directory: ${file}`);
  }
  return commandFiles;
}

module.exports =
{
  loadCommands,
  toggleSlashCommand,
  togglePrefixCommand,
};

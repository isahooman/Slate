const { Collection } = require('discord.js');
const logger = require('./logger.js');
const path = require('path');
const fs = require('fs');

/**
 * Load all commands
 * @param {import("discord.js").Client} client Discord Client
 */
function loadCommands(client) {
  // Initialize collections to store commands
  client.slashCommands = new Collection();
  client.prefixCommands = new Collection();

  // Load commands from their respective directories
  loadSlashCommands(client, path.join(__dirname, '../commands/slash'));
  loadPrefixCommands(client, path.join(__dirname, '../commands/prefix'));
}

/**
 * Load Slash Commands
 * @param {import("discord.js").Client} client Discord Client
 * @param {directory} directory Slash Command Directory
 */
function loadSlashCommands(client, directory) {
  const commandFiles = readCommands(directory);

  // pass thru slash command files and try to load each one
  for (const fileData of commandFiles) try {
    // Add the slash command to the collection
    const command = require(fileData.path);
    client.slashCommands.set(command.data.name, command);
    logger.loading(`Slash Command Loaded: ${command.data.name}`);
  } catch (error) {
    logger.error(`Error loading slash command at ${fileData.path}: ${error.message}`, client);
  }
}

/**
 * Load Prefix Commands
 * @param {import("discord.js").Client} client Discord Client
 * @param {directory} directory Prefix Command Directory
 */
function loadPrefixCommands(client, directory) {
  const commandFiles = readCommands(directory);
  const commandAliases = new Map();

  // Pass through prefix command files and try to load each one
  for (const fileData of commandFiles) try {
    // Add the prefix command to the collection
    const command = require(fileData.path);

    // Check if the command has aliases
    if (command.aliases && Array.isArray(command.aliases)) for (const alias of command.aliases) commandAliases.set(alias.toLowerCase(), command);

    client.prefixCommands.set(command.name.toLowerCase(), command);
    logger.loading(`Prefix Command Loaded: ${command.name}`);
  } catch (error) {
    logger.error(`Error loading prefix command at ${fileData.path}: ${error.message}`, client);
  }
  client.commandAliases = commandAliases;
}

/**
 * Recursively Read Command Directories
 * @param {directory} directory A given directory
 * @returns {Array} An array of files
 */
function readCommands(directory) {
  const files = fs.readdirSync(directory);
  let commandFiles = [];
  for (const file of files) {
    const filepath = path.join(directory, file);
    if (fs.statSync(filepath).isDirectory()) commandFiles = commandFiles.concat(readCommands(filepath));
    else if (file.endsWith('.js')) commandFiles.push({ path: filepath, directory });
  }
  return commandFiles;
}

module.exports =
  {
    loadCommands,
  };


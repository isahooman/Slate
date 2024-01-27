const { Collection } = require('discord.js');
const logger = require('./logger.js');
const path = require('path');
const fs = require('fs');

// Load all commands
function loadCommands(client) {
  // Initialize collections to store commands
  client.slashCommands = new Collection();
  client.prefixCommands = new Collection();

  // Load commands from their respective directories
  loadSlashCommands(client, path.join(__dirname, '../commands/slash'));
  loadPrefixCommands(client, path.join(__dirname, '../commands/prefix'));
}

// Load slash commands
function loadSlashCommands(client, directory) {
  const commandFiles = readCommands(directory);

  // pass thru slash command files and try to load each one
  for (const fileData of commandFiles) try {
    // Add the slash command to the collection
    const command = require(fileData.path);
    client.slashCommands.set(command.data.name, command);
    logger.info(`Slash command loaded: ${command.data.name}`);
  } catch (error) {
    logger.error(`Error loading slash command at ${fileData.path}: ${error.message}`, client);
  }
}

// Load prefix commands
function loadPrefixCommands(client, directory) {
  const commandFiles = readCommands(directory);

  // Pass thru prefix command files and try to load each one
  for (const fileData of commandFiles) try {
    // Add the prefix command to the collection
    const command = require(fileData.path);
    client.prefixCommands.set(command.name.toLowerCase(), command);
    logger.info(`Prefix command loaded: ${command.name}`);
  } catch (error) {
    logger.error(`Error loading prefix command at ${fileData.path}: ${error.message}`, client);
  }
}

// Recursively read command directories
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

module.exports = loadCommands;

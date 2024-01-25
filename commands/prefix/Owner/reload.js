// Import required modules
const logger = require('../../../util/logger');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'reload',
  category: 'owner',
  usage: 'reload <slash/prefix> or <command name>',
  description: 'Reloads a command or all commands.',
  async execute(message, args) {
    const arg = args[0];

    // Check if the arg is either 'prefix' or 'slash'
    if (arg === 'prefix' || arg === 'slash') {
      logger.info(`Reloading all ${arg} commands.`);
      await reloadAllCommands(message.client, arg);
      // Send a confirmation message
      message.channel.send(`All ${arg} commands were reloaded!`);
      logger.debug(`All ${arg} commands successfully reloaded.`);
    } else if (arg) {
      logger.debug(`Attempting to reload command: ${arg}`);
      const nearestSlashCommand = findNearestCommand(arg, message.client.slashCommands, 'slash');
      const nearestPrefixCommand = findNearestCommand(arg, message.client.prefixCommands, 'prefix');

      let reloadedTypes = [];

      if (nearestSlashCommand) {
        // Log found slash command and reload it
        logger.debug(`Found slash command: ${nearestSlashCommand.data.name}`);
        await reloadCommand(nearestSlashCommand, message);
        reloadedTypes.push('slash');
      }
      if (nearestPrefixCommand) {
        // Log found prefix command and reload it
        logger.debug(`Found prefix command: ${nearestPrefixCommand.name}`);
        await reloadCommand(nearestPrefixCommand, message);
        reloadedTypes.push('prefix');
      }

      let responseMessage = `\#\#\# Reloaded commands for:\n`;
      if (reloadedTypes.includes('slash')) responseMessage += `Slash: ${nearestSlashCommand ? nearestSlashCommand.data.name : 'none'}\n`;
      if (reloadedTypes.includes('prefix')) responseMessage += `Prefix: ${nearestPrefixCommand ? nearestPrefixCommand.name : 'none'}`;
      if (reloadedTypes.length === 0) responseMessage = `No command found with name '${arg}'.`;
      message.channel.send(responseMessage);

      logger.debug(`Reload completed for command: ${arg}`);
    } else {
      // Log reloading information for all commands
      logger.debug('No command provided. Reloading all commands.');
      await reloadAllCommands(message.client, 'slash');
      await reloadAllCommands(message.client, 'prefix');
      // Send a confirmation message
      message.channel.send('All commands were reloaded!');
      logger.debug('All commands successfully reloaded.');
    }
  },
};

// Search for command names
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

  return nearestCommand;
}

// Function to reload a specific command
async function reloadCommand(command, interaction) {
  const commandName = command.data ? command.data.name : command.name;
  logger.debug(`Reloading command: ${commandName}`);

  const commandType = command.type === 'slash' ? 'slash' : 'prefix';
  const baseDir = path.join(__dirname, '..', '..', '..', 'commands', commandType);
  let foundPath = null;

  // Search for the command file in command subfolders
  const subdirs = await fs.promises.readdir(baseDir);
  for (const subdir of subdirs) {
    const subdirPath = path.join(baseDir, subdir);
    if ((await fs.promises.stat(subdirPath)).isDirectory()) {
      const files = await fs.promises.readdir(subdirPath);
      if (files.includes(`${commandName}.js`)) {
        foundPath = path.join(subdirPath, `${commandName}.js`);
        break;
      }
    }
  }

  if (!foundPath) {
    logger.warn(`Command file not found for command: ${commandName}.`);
    return;
  }

  // Delete cached command data
  delete require.cache[require.resolve(foundPath)];

  try {
    const newCommand = require(foundPath);
    if (command.data) {
      interaction.client.slashCommands.set(newCommand.data.name, newCommand);
      logger.debug(`Slash command '${newCommand.data.name}' reloaded`);
    } else {
      interaction.client.prefixCommands.set(newCommand.name.toLowerCase(), newCommand);
      logger.debug(`Prefix command '${newCommand.name}' reloaded`);
    }
  } catch (error) {
    logger.error(`Error reloading command '${commandName}': ${error.message}`);
  }
}

// Function to reload all commands of a specific type
function reloadAllCommands(client, commandType) {
  logger.debug(`Reloading all ${commandType} commands`);
  const commands = commandType === 'slash' ? client.slashCommands : client.prefixCommands;
  const baseDir = path.join(__dirname, '..', '..', '..', 'commands', commandType);
  const commandFiles = readCommandFilesRecursive(baseDir);

  commandFiles.forEach(file => {
    delete require.cache[require.resolve(file)];
    try {
      const newCommand = require(file);
      const commandKey = commandType === 'slash' ? newCommand.data.name : newCommand.name.toLowerCase();
      commands.set(commandKey, newCommand);
      logger.debug(`Reloaded ${commandType} command: ${commandKey}`);
    } catch (error) {
      logger.error(`Error reloading ${commandType} command at ${file}: ${error.message}`);
    }
  });
}

// Read command folders and sub folders
function readCommandFilesRecursive(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) results = results.concat(readCommandFilesRecursive(filePath));
    else if (stat.isFile()) results.push(filePath);
  });
  return results;
}

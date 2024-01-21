// Import required modules
const logger = require('../../../util/logger');
const path = require('path');

// Export the command module
module.exports = {
  name: 'reload',
  description: 'Reloads a command or all commands.',
  async execute(message, args) {
    const arg = args[0];

    // Check if the argument is either 'prefix' or 'slash'
    if (arg === 'prefix' || arg === 'slash') {
      logger.info(`Reloading all ${arg} commands.`);
      await reloadAllCommands(message.client, arg);
      message.channel.send(`All ${arg} commands were reloaded!`);
      logger.debug(`All ${arg} commands successfully reloaded.`);
    } else if (arg) { // If the arg doesnt match a type, search command names
      logger.debug(`Attempting to reload command: ${arg}`);
      const nearestSlashCommand = findNearestCommand(arg, message.client.slashCommands, 'slash');
      const nearestPrefixCommand = findNearestCommand(arg, message.client.prefixCommands, 'prefix');

      let reloadedTypes = [];

      if (nearestSlashCommand) { // Reload the matching slash command
        logger.debug(`Found slash command: ${nearestSlashCommand.name}`);
        await reloadCommand(nearestSlashCommand, message);
        reloadedTypes.push('slash');
      }
      if (nearestPrefixCommand) { // Reload the matching prefix command
        logger.debug(`Found prefix command: ${nearestPrefixCommand.name}`);
        await reloadCommand(nearestPrefixCommand, message);
        reloadedTypes.push('prefix');
      }

      // Provide a response based on the reloaded command types
      if (reloadedTypes.length === 2) message.channel.send(`Both slash and prefix command \`${arg}\` have been reloaded.`);
      else if (reloadedTypes.length === 1) message.channel.send(`${reloadedTypes[0]} command \`${arg}\` has been reloaded.`);
      else message.channel.send(`No command found with name '${arg}'.`);

      logger.debug(`Reload completed for command: ${arg}`);
    } else {
      logger.debug('No command provided. Reloading all commands.');
      await reloadAllCommands(message.client, 'slash');
      await reloadAllCommands(message.client, 'prefix');
      message.channel.send('All commands were reloaded!'); // Send a message indicating that all commands were reloaded
      logger.debug('All commands successfully reloaded.');
    }
  },
};

// Function to reload a specific command
function reloadCommand(command, interaction) {
  const commandName = command.data ? command.data.name : command.name;
  logger.debug(`Reloading command: ${commandName}`);
  let commandPath = '';

  if (command.directory) {
    logger.debug(`Directory: ${command.directory}`);
    commandPath = path.join(command.directory, `${commandName}.js`);
  } else {
    logger.warn(`Directory not found for command: ${commandName}.`);
    commandPath = path.join(__dirname, 'default_directory', `${commandName}.js`);
  }

  delete require.cache[require.resolve(commandPath)];

  try {
    const newCommand = require(commandPath);
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

// Function to find the nearest command based on input
function findNearestCommand(input, commands, type) {
  let nearestCommand = null;
  let highestSimilarity = -1;

  commands.forEach((cmd, cmdName) => {
    if (containsAllCharsInOrder(input, cmdName)) {
      const similarity = cmdName.length - input.length;
      if (similarity >= 0 && similarity > highestSimilarity) {
        highestSimilarity = similarity;
        nearestCommand = { ...cmd, type };
      }
    }
  });

  return nearestCommand;
}

// Function to check if a substring contains all characters of a string in order
function containsAllCharsInOrder(sub, str) {
  let subIndex = 0;
  for (let i = 0; i < str.length && subIndex < sub.length; i++) if (str[i] === sub[subIndex]) subIndex++;

  return subIndex === sub.length;
}

// Function to reload all commands of a specific type
function reloadAllCommands(client, commandType) {
  logger.debug(`Reloading all ${commandType} commands`);
  const commands = commandType === 'slash' ? client.slashCommands : client.prefixCommands;
  const commandFiles = client.readCommands(path.join(__dirname, '..', '..', '..', 'commands', commandType));

  for (const fileData of commandFiles) {
    delete require.cache[require.resolve(fileData.path)];
    try {
      const newCommand = require(fileData.path);
      const commandKey = commandType === 'slash' ? newCommand.data.name : newCommand.name.toLowerCase();
      commands.set(commandKey, newCommand);
      logger.debug(`Reloaded ${commandType} command: ${commandKey}`);
    } catch (error) {
      logger.error(`Error reloading ${commandType} command at ${fileData.path}: ${error.message}`);
    }
  }
}

const { reloadAllEvents, reloadAllCommands, findNearestCommand } = require('../../../components/loader');
const logger = require('../../../components/logger.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'reload',
  category: 'Owner',
  usage: 'reload <slash/prefix/events> or <command name>',
  description: 'Reloads a command, all commands, or events.',
  async execute(message, args) {
    const arg = args[0];

    // Check if the arg is either 'prefix', 'slash', or 'events'
    if (arg === 'prefix' || arg === 'slash') {
      // Reload all commands of a given type
      logger.info(`[Reload Command] Reloading all ${arg} commands.`);
      await reloadAllCommands(message.client, arg);
      message.channel.send(`All ${arg} commands were reloaded!`);
      logger.debug(`[Reload Command] All ${arg} commands successfully reloaded.`);
    // Reload events
    } else if (arg === 'events') {
      logger.info('[Reload Command] Reloading events.');
      reloadAllEvents(message.client);
      message.channel.send('All events were reloaded!');
      logger.debug('[Reload Command] All events successfully reloaded.');
    // Reload command of given name
    } else if (arg) {
      logger.debug(`[Reload Command] Attempting to reload command: ${arg}`);
      const nearestSlashCommand = findNearestCommand(arg, message.client.slashCommands, 'slash');
      const nearestPrefixCommand = findNearestCommand(arg, message.client.prefixCommands, 'prefix');

      let reloadedTypes = [];

      if (nearestSlashCommand) {
        // Log found slash command and reload it
        logger.debug(`[Reload Command] Found slash command: ${nearestSlashCommand.data.name}`);
        await reloadCommand(nearestSlashCommand, message);
        reloadedTypes.push('slash');
      }
      if (nearestPrefixCommand) {
        // Log found prefix command and reload it
        logger.debug(`[Reload Command] Found prefix command: ${nearestPrefixCommand.name}`);
        await reloadCommand(nearestPrefixCommand, message);
        reloadedTypes.push('prefix');
      }

      let responseMessage = `### Reloaded commands:\n`;
      if (reloadedTypes.includes('slash')) responseMessage += `Slash: ${nearestSlashCommand ? nearestSlashCommand.data.name : 'none'}\n`;
      if (reloadedTypes.includes('prefix')) responseMessage += `Prefix: ${nearestPrefixCommand ? nearestPrefixCommand.name : 'none'}`;
      if (reloadedTypes.length === 0) responseMessage = `No command found with name '${arg}'.`;
      message.channel.send(responseMessage);

      logger.debug(`[Reload Command] Reload completed for command: ${arg}`);
    } else {
      logger.debug('[Reload Command] No command provided. Reloading everything.');
      await reloadAllCommands(message.client, 'slash');
      await reloadAllCommands(message.client, 'prefix');
      reloadAllEvents(message.client);
      message.channel.send('All commands and events were reloaded!');
      logger.debug('[Reload Command] All commands and events successfully reloaded.');
    }
  },
};

/**
 * Reload a specific command
 * @param {object} command - Command object
 * @param {interaction} interaction - Discord Interaction
 */
async function reloadCommand(command, interaction) {
  const commandName = command.data ? command.data.name : command.name;
  logger.debug(`[Reload Command] Reloading command: ${commandName}`);

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
    logger.warn(`[Reload Command] Command file not found for command: ${commandName}.`);
    return;
  }

  // Delete cached command data
  delete require.cache[require.resolve(foundPath)];

  try {
    const newCommand = require(foundPath);
    if (command.data) {
      interaction.client.slashCommands.set(newCommand.data.name, newCommand);
      logger.debug(`[Reload Command] Slash command '${newCommand.data.name}' reloaded`);
    } else {
      interaction.client.prefixCommands.set(newCommand.name.toLowerCase(), newCommand);
      logger.debug(`[Reload Command] Prefix command '${newCommand.name}' reloaded`);
    }
  } catch (error) {
    logger.error(`[Reload Command] Error reloading command '${commandName}': ${error.message}`);
  }
}

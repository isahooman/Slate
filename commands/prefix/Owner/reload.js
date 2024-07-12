const { reloadAllEvents, reloadAllCommands, findNearestCommand, reloadCommand } = require('../../../components/loader');
const logger = require('../../../components/logger.js');

module.exports = {
  name: 'reload',
  category: 'Owner',
  usage: 'reload <slash/prefix/events> or <command name>',
  description: 'Reloads a command, all commands, or events.',
  allowDM: true,
  async execute(message, args) {
    const arg = args[0];

    // Check if the arg is either 'prefix', 'slash',
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
      logger.debug(`[Reload Command] Attempting to find command: ${arg}`);
      const nearestSlashCommand = findNearestCommand(arg, message.client.slashCommands, 'slash');
      const nearestPrefixCommand = findNearestCommand(arg, message.client.prefixCommands, 'prefix');

      let reloadedTypes = [];

      if (nearestSlashCommand) {
        // Log found slash command and reload it
        await reloadCommand(nearestSlashCommand, message);
        reloadedTypes.push('slash');
      }
      if (nearestPrefixCommand) {
        // Log found prefix command and reload it
        await reloadCommand(nearestPrefixCommand, message);
        reloadedTypes.push('prefix');
      }

      // Response message
      let responseMessage = `### Reloaded commands:\n`;
      // If slash commands were reloaded, add its line to the response
      if (reloadedTypes.includes('slash')) responseMessage += `Slash: ${nearestSlashCommand ? nearestSlashCommand.data.name : 'none'}\n`;
      // If prefix commands were reloaded, add its line to the response
      if (reloadedTypes.includes('prefix')) responseMessage += `Prefix: ${nearestPrefixCommand ? nearestPrefixCommand.name : 'none'}`;
      // Indicate if no commands were reloaded
      if (reloadedTypes.length === 0) responseMessage = `No commands found with name '${arg}'.`;
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

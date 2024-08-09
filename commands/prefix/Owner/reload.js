const { reloadAllEvents, reloadAllCommands, findNearestCommand, reloadCommand } = require('../../../components/loader');
const { logger, reloadLogger } = require('../../../components/loggerUtil.js');

module.exports = {
  name: 'reload',
  category: 'Owner',
  usage: 'reload <slash/prefix/events> or <command name> or logger',
  description: 'Reloads a command, all commands, or events.',
  allowDM: true,
  async execute(message, args) {
    const arg = args[0];
    logger.debug(`[Reload Command] Received reload command with argument: ${arg}`);

    // Reload the logger
    if (arg === 'logger') {
      logger.info('[Reload Command] Reloading logger.');
      await reloadLogger();
      message.channel.send('Logger reloaded');
      logger.debug('[Reload Command] Logger reloaded successfully.');
    } else if (arg === 'prefix' || arg === 'slash' || arg === 'events') {
      // Reload all commands or events of a given type
      if (arg === 'prefix') {
        logger.info('[Reload Command] Reloading all prefix commands.');
        await reloadAllCommands(message.client, 'prefix');
        message.channel.send('All prefix commands were reloaded!');
      } else if (arg === 'slash') {
        logger.info('[Reload Command] Reloading all slash commands.');
        await reloadAllCommands(message.client, 'slash');
        message.channel.send('All slash commands were reloaded!');
      } else if (arg === 'events') {
        logger.info('[Reload Command] Reloading events.');
        reloadAllEvents(message.client);
        message.channel.send('All events were reloaded!');
      }
    } else if (arg) {
      // Search for commands with the given arg
      const nearestSlashCommand = findNearestCommand(arg, message.client.slashCommands, 'slash');
      const nearestPrefixCommand = findNearestCommand(arg, message.client.prefixCommands, 'prefix');

      let responseMessage = '### Reloaded commands:\n';

      // Reload the command based on the type found
      if (nearestSlashCommand) {
        logger.info(`[Reload Command] Reloading slash command: ${nearestSlashCommand.data.name}`);
        await reloadCommand(message.client, nearestSlashCommand.data.name, 'slash');
        responseMessage += `Slash: ${nearestSlashCommand.data.name}\n`;
      }
      if (nearestPrefixCommand) {
        logger.info(`[Reload Command] Reloading prefix command: ${nearestPrefixCommand.name}`);
        await reloadCommand(message.client, nearestPrefixCommand.name, 'prefix');
        responseMessage += `Prefix: ${nearestPrefixCommand.name}\n`;
      }

      // If no command was found let the user know
      if (!nearestSlashCommand && !nearestPrefixCommand) responseMessage = `No command found with name '${arg}'.`;

      message.channel.send(responseMessage);
    } else {
      logger.debug('[Reload Command] No argument provided. Reloading everything.');
      logger.info('[Reload Command] Reloading all slash commands.');
      await reloadAllCommands(message.client, 'slash');
      logger.info('[Reload Command] Reloading all prefix commands.');
      await reloadAllCommands(message.client, 'prefix');
      logger.info(`[Reload Command] Reloading all events.`);
      reloadAllEvents(message.client);
      logger.info('[Reload Command] Reloading logger.');
      reloadLogger();
      logger.debug('[Reload Command] Everything has been reloaded.');
      message.reply('All Commands, Events and Logger have been successfully reloaded.');
    }
  },
};

const { reloadAllEvents, reloadAllCommands, findNearestCommand, reloadCommand } = require('../../../components/loader');
const { logger, reloadLogger } = require('../../../components/loggerUtil.js');
const { cache } = require('../../../bot.js');

module.exports = {
  name: 'reload',
  category: 'Owner',
  usage: 'reload <slash/prefix/events/cache> or <command name> or logger',
  description: 'Reloads a command, all commands, or events.',
  allowDM: true,
  async execute(message, args) {
    const arg = args[0];
    logger.debug(`[Reload Command] Received reload command with argument: ${arg}`);

    // Reload the cache
    if (arg === 'cache') {
      logger.info('[Reload Command] Reloading cache.');
      // Clear existing cache data
      cache.guilds.clear();
      cache.channels.clear();
      cache.threads.clear();
      cache.members.clear();
      // Gather new data
      cache.cacheServers(message.client);
      cache.cacheChannels(message.client);
      cache.cacheThreads(message.client);
      message.client.guilds.cache.forEach(guild => {
        cache.cacheMembers(guild);
      });

      message.channel.send('Cache reloaded!');
      logger.debug('[Reload Command] Cache reloaded successfully.');
    } else if (arg === 'logger') {
      // Reload the logger
      logger.info('[Reload Command] Reloading logger.');
      await reloadLogger();
      message.channel.send('Logger reloaded');
      logger.debug('[Reload Command] Logger reloaded successfully.');
    } else if (arg === 'prefix' || arg === 'slash' || arg === 'events') {
      // Reload all prefix commands
      if (arg === 'prefix') {
        logger.info('[Reload Command] Reloading all prefix commands.');
        await reloadAllCommands(message.client, 'prefix');
        message.channel.send('All prefix commands were reloaded!');
      } else if (arg === 'slash') {
        // Reload all slash commands
        logger.info('[Reload Command] Reloading all slash commands.');
        await reloadAllCommands(message.client, 'slash');
        message.channel.send('All slash commands were reloaded!');
      } else if (arg === 'events') {
        // Reload all events
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

      // If no command was found, send a message
      if (!nearestSlashCommand && !nearestPrefixCommand) responseMessage = `No command found with name '${arg}'.`;

      message.channel.send(responseMessage);
    } else {
      logger.debug('[Reload Command] No argument provided. Reloading everything.');
      // Reload slash commands
      logger.info('[Reload Command] Reloading all slash commands.');
      await reloadAllCommands(message.client, 'slash');
      // Reload prefix commands
      logger.info('[Reload Command] Reloading all prefix commands.');
      await reloadAllCommands(message.client, 'prefix');
      // Reload events
      logger.info(`[Reload Command] Reloading all events.`);
      reloadAllEvents(message.client);
      // Reload logger
      logger.info('[Reload Command] Reloading logger.');
      reloadLogger();
      // Refresh cache
      // Clear existing cache data
      cache.guilds.clear();
      cache.channels.clear();
      cache.threads.clear();
      cache.members.clear();
      // Gather new data
      cache.cacheServers(message.client);
      cache.cacheChannels(message.client);
      cache.cacheThreads(message.client);
      message.client.guilds.cache.forEach(guild => {
        cache.cacheMembers(guild);
      });

      logger.debug('[Reload Command] Everything has been reloaded.');
      message.reply('Reloaded:\n- Slash Commands\n- Prefix Commands\n- Events\n- Cache\n- Logger');
    }
  },
};

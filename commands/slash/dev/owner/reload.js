const { reloadAllCommands, reloadAllEvents, findNearestCommand, reloadCommand } = require('../../../../components/loader.js');
const { SlashCommandBuilder } = require('discord.js');
const { logger, reloadLogger } = require('../../../../components/loggerUtil.js');
const { cache } = require('../../../../bot.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command or all commands.')
    .addStringOption(option => option.setName('command')
      .setDescription('The command to reload'))
    .addStringOption(option => option.setName('type')
      .setDescription('The type of commands to reload')
      .addChoices(
        { name: 'Events', value: 'events' },
        { name: 'Slash', value: 'slash' },
        { name: 'Prefix', value: 'prefix' },
        { name: 'Logger', value: 'logger' },
        { name: 'Cache', value: 'cache' },
      )),
  category: 'owner',
  async execute(interaction) {
    const commandName = interaction.options.getString('command');
    const type = interaction.options.getString('type');

    if (type === 'events') {
      logger.info('[Reload Command] Reloading all events.');
      await reloadAllEvents(interaction.client);
      await interaction.reply('All events were reloaded!');
      logger.info('[Reload Command] All events successfully reloaded.');
    } else if (type === 'slash') {
      logger.info('[Reload Command] Reloading all slash commands.');
      await reloadAllCommands(interaction.client, 'slash');
      await interaction.reply('All slash commands were reloaded!');
      logger.info('[Reload Command] All slash commands successfully reloaded.');
    } else if (type === 'prefix') {
      logger.info('[Reload Command] Reloading all prefix commands.');
      await reloadAllCommands(interaction.client, 'prefix');
      await interaction.reply('All prefix commands were reloaded!');
      logger.info('[Reload Command] All prefix commands successfully reloaded.');
    } else if (type === 'logger') {
      logger.info('[Reload Command] Reloading logger.');
      await reloadLogger();
      logger.info('[Reload Command] Logger successfully reloaded.');
      await interaction.reply('Logger was reloaded!');
    } else if (type === 'cache') {
      logger.info('[Reload Command] Reloading cache.');
      cache.guilds.clear();
      cache.channels.clear();
      cache.threads.clear();
      cache.members.clear();
      // Gather new data
      cache.cacheServers(interaction.client);
      cache.cacheChannels(interaction.client);
      cache.cacheThreads(interaction.client);
      interaction.client.guilds.cache.forEach(guild => {
        cache.cacheMembers(guild);
      });

      logger.info('[Reload Command] Cache successfully reloaded.');
      await interaction.reply('Cache was reloaded!');
    } else if (commandName) {
      logger.debug(`[Reload Command] Attempting to find command: ${commandName}`);
      // Search for commands by name within both command types
      const nearestSlashCommand = findNearestCommand(commandName, interaction.client.slashCommands, 'slash');
      const nearestPrefixCommand = findNearestCommand(commandName, interaction.client.prefixCommands, 'prefix');

      let responseMessage = '### Reloaded commands:\n';

      // Reload the command based on the type found
      if (nearestSlashCommand) {
        logger.info(`[Reload Command] Reloading slash command: ${nearestSlashCommand.data.name}`);
        await reloadCommand(interaction.client, nearestSlashCommand.data.name, 'slash');
        responseMessage += `Slash: ${nearestSlashCommand.data.name}\n`;
      }
      if (nearestPrefixCommand) {
        logger.info(`[Reload Command] Reloading prefix command: ${nearestPrefixCommand.name}`);
        await reloadCommand(interaction.client, nearestPrefixCommand.name, 'prefix');
        responseMessage += `Prefix: ${nearestPrefixCommand.name}\n`;
      }

      // If no command was found let the user know
      if (!nearestSlashCommand && !nearestPrefixCommand) responseMessage = `No command found with name '${commandName}'.`;

      await interaction.reply(responseMessage);
      logger.debug(`[Reload Command] Reload completed for command: ${commandName}`);
    } else {
      logger.debug('[Reload Command] No argument provided. Reloading everything.');
      // Reload slash commands
      logger.info('[Reload Command] Reloading all slash commands.');
      await reloadAllCommands(interaction.client, 'slash');
      // Reload prefix commands
      logger.info('[Reload Command] Reloading all prefix commands.');
      await reloadAllCommands(interaction.client, 'prefix');
      // Reload events
      logger.info(`[Reload Command] Reloading all events.`);
      reloadAllEvents(interaction.client);
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
      cache.cacheServers(interaction.client);
      cache.cacheChannels(interaction.client);
      cache.cacheThreads(interaction.client);
      interaction.client.guilds.cache.forEach(guild => {
        cache.cacheMembers(guild);
      });

      logger.debug('[Reload Command] Everything has been reloaded.');
      interaction.reply('Reloaded:\n- Slash Commands\n- Prefix Commands\n- Events\n- Cache\n- Logger');
    }
  },
};

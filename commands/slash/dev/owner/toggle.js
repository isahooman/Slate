const { reloadAllEvents, togglePrefixCommand, toggleSlashCommand, setEventEnabled, isEventEnabled, isPrefixCommandEnabled, isSlashCommandEnabled, reloadEvent, findNearestCommand } = require('../../../../components/loader.js');
const { SlashCommandBuilder } = require('discord.js');
const { logger } = require('../../../../components/loggerUtil.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('toggle')
    .setDescription('Toggles events, commands, or logging levels.')
    .addStringOption(option => option.setName('type')
      .setDescription('The type of item to toggle')
      .addChoices(
        { name: 'Event', value: 'event' },
        { name: 'Prefix Command', value: 'prefixcommand' },
        { name: 'Slash Command', value: 'slashcommand' },
        { name: 'Log', value: 'log' },
      ))
    .addStringOption(option => option.setName('target')
      .setDescription('The name of the event, command, or log level to toggle')),
  category: 'owner',
  execute(interaction, client) {
    logger.debug(`[Toggle Command] Starting toggle for type: ${interaction.options.getString('type')} and target: ${interaction.options.getString('target')}`);
    const type = interaction.options.getString('type').toLowerCase();
    const target = interaction.options.getString('target');

    let responseMessage = '';

    switch (type) {
      case 'event':
        logger.debug(`[Toggle Command] Toggle type: event`);
        if (!target) {
          logger.debug(`[Toggle Command] Target not provided`);
          interaction.reply('Please specify an event name to toggle.');
          return;
        }

        // Check if the event exists
        if (!isEventEnabled(target)) {
          logger.debug(`[Toggle Command] Event '${target}' does not exist`);
          interaction.reply(`Event '${target}' does not exist.`);
          return;
        }

        // Toggle the event
        const eventState = isEventEnabled(target);
        const newEventState = !eventState;
        setEventEnabled(target, newEventState);

        // Reload events to toggle listeners
        reloadAllEvents(client);

        responseMessage = `Event '${target}' is now ${newEventState ? 'enabled' : 'disabled'}.`;
        break;

      case 'prefixcommand':
        logger.debug(`[Toggle Command] Toggle type: prefixcommand`);
        if (!target) {
          logger.debug(`[Toggle Command] Target not provided`);
          interaction.reply('Please specify a prefix command name to toggle.');
          return;
        }

        // Find the nearest command matching the input
        const nearestPrefixCommand = findNearestCommand(target, client.prefixCommands, 'prefix');

        // Check if the command was found
        if (!nearestPrefixCommand) {
          logger.debug(`[Toggle Command] No prefix command found with name '${target}'`);
          interaction.reply(`No prefix command found with name '${target}'.`);
          return;
        }

        // Toggle the command
        const prefixState = isPrefixCommandEnabled(nearestPrefixCommand.name);
        const newPrefixState = !prefixState;
        togglePrefixCommand(nearestPrefixCommand.name, client, newPrefixState);

        responseMessage = `Prefix command **\`${nearestPrefixCommand.name}\`** is now **${newPrefixState ? 'enabled' : 'disabled'}**`;

        // Reload message events to clear prefix toggle cache
        reloadEvent(client, 'messageCreate');
        reloadEvent(client, 'messageUpdate');
        break;

      case 'slashcommand':
        logger.debug(`[Toggle Command] Toggle type: slashcommand`);
        if (!target) {
          logger.debug(`[Toggle Command] Target not provided`);
          interaction.reply('Please specify a slash command name to toggle.');
          return;
        }

        // Find the nearest command matching the input
        const nearestSlashCommand = findNearestCommand(target, client.slashCommands, 'slash');

        // Check if the command was found
        if (!nearestSlashCommand) {
          logger.debug(`[Toggle Command] No slash command found with name '${target}'`);
          interaction.reply(`No slash command found with name '${target}'.`);
          return;
        }

        // Toggle the command
        const slashState = isSlashCommandEnabled(nearestSlashCommand.data.name);
        const newSlashState = !slashState;
        toggleSlashCommand(nearestSlashCommand.data.name, client, newSlashState);

        responseMessage = `Slash command **\`${nearestSlashCommand.data.name}\`** is now **${newSlashState ? 'enabled' : 'disabled'}**`;

        // Reload slash handler to clear toggle cache
        reloadEvent(client, 'interactionCreate');
        break;

      case 'log':
        logger.debug(`[Toggle Command] Toggle type: log`);
        if (!target) {
          logger.debug(`[Toggle Command] Target not provided`);
          interaction.reply('Please specify a log level to toggle.');
          return;
        }

        const level = target.toUpperCase();

        // Check if the given level exist.
        if (!(level in logger.levels)) {
          logger.debug(`[Toggle Command] Invalid log level: ${level}`);
          const availableLevels = Object.keys(logger.levels).map(lvl => `- ${lvl}`).join('\n');
          interaction.reply(`Please specify a valid level.\n${availableLevels}`);
          return;
        }

        // Get the current state of the logging level.
        const logState = logger.isLevelEnabled(level);

        // Toggle the logging level.
        logger.setLevelEnabled(level, !logState);

        responseMessage = `${level} logging is now ${!logState ? 'enabled' : 'disabled'}.`;
        break;

      default:
        logger.debug(`[Toggle Command] Invalid toggle type: ${type}`);
        interaction.reply('Invalid toggle type. Please choose from: Event, Prefix Command, Slash Command, Log.');
        return;
    }

    interaction.reply(responseMessage);
  },
};


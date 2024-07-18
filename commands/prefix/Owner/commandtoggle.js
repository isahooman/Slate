const { togglePrefixCommand, toggleSlashCommand, isPrefixCommandEnabled, isSlashCommandEnabled, reloadEvent, findNearestCommand } = require('../../../components/loader.js');
const { logger } = require('../../../components/loggerUtil.js');

module.exports = {
  name: 'commandtoggle',
  usage: 'commantoggle [type] <command_name>',
  category: 'Owner',
  aliases: ['ctoggle', 'togglecommand'],
  allowDM: true,
  description: 'Toggles the specified command',
  execute(message, args) {
    let commandType = args[0];
    let commandName = args[1];

    // If no type is specified, default to both
    if (!commandType || !['slash', 'prefix'].includes(commandType.toLowerCase())) {
      commandType = 'both';
      commandName = args[0];
    }

    // Find the nearest command matching the input
    const nearestPrefixCommand = commandType === 'prefix' || commandType === 'both' ? findNearestCommand(commandName, message.client.prefixCommands, 'prefix') : null;
    const nearestSlashCommand = commandType === 'slash' || commandType === 'both' ? findNearestCommand(commandName, message.client.slashCommands, 'slash') : null;

    // Check if either a prefix or slash command was found
    if (!nearestPrefixCommand && !nearestSlashCommand) {
      logger.warn(`[CommandToggle Command] No command found with name '${commandName}'.`);
      message.reply(`No command found with name '${commandName}'.`);
      return;
    }

    let responseMessage = '### Toggled commands:\n';

    // Toggle commands based on type
    if (nearestPrefixCommand && (commandType === 'prefix' || commandType === 'both')) {
      const prefixState = isPrefixCommandEnabled(nearestPrefixCommand.name);
      const newPrefixState = !prefixState;
      togglePrefixCommand(nearestPrefixCommand.name, message.client, newPrefixState);
      responseMessage += `Prefix: **\`${nearestPrefixCommand.name}\`** is now **${newPrefixState ? 'enabled' : 'disabled'}**\n`;
    }

    if (nearestSlashCommand && (commandType === 'slash' || commandType === 'both')) {
      const slashState = isSlashCommandEnabled(nearestSlashCommand.data.name);
      const newSlashState = !slashState;
      toggleSlashCommand(nearestSlashCommand.data.name, message.client, newSlashState);
      responseMessage += `Slash: **\`${nearestSlashCommand.data.name}\`** is now **${newSlashState ? 'enabled' : 'disabled'}**\n`;
    }

    // Send a response notifying of the new state
    message.reply(responseMessage);

    // Reload toggle cache
    reloadEvent(message.client, 'messageCreate');
    reloadEvent(message.client, 'messageUpdate');
    reloadEvent(message.client, 'interactionCreate');
  },
};

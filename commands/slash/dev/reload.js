const { reloadAllCommands, reloadAllEvents, findNearestCommand, reloadCommand } = require('../../../components/loader.js');
const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../components/logger.js');

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
      )),
  async execute(interaction) {
    const commandName = interaction.options.getString('command');
    const Type = interaction.options.getString('type');

    if (Type === 'events') {
      logger.info('[Reload Command] Reloading all events.');
      await reloadAllEvents(interaction.client);
      await interaction.reply('All events were reloaded!');
      logger.info('[Reload Command] All events successfully reloaded.');
    } else if (Type === 'slash') {
      logger.info('[Reload Command] Reloading all slash commands.');
      await reloadAllCommands(interaction.client, 'slash');
      await interaction.reply('All slash commands were reloaded!');
      logger.info('[Reload Command] All slash commands successfully reloaded.');
    } else if (Type === 'prefix') {
      logger.info('[Reload Command] Reloading all prefix commands.');
      await reloadAllCommands(interaction.client, 'prefix');
      await interaction.reply('All prefix commands were reloaded!');
      logger.info('[Reload Command] All prefix commands successfully reloaded.');
    } else if (commandName) {
      logger.debug(`[Reload Command] Attempting to find command: ${commandName}`);
      // Search for commands by name within both command types
      const nearestSlashCommand = findNearestCommand(commandName, interaction.client.slashCommands, 'slash');
      const nearestPrefixCommand = findNearestCommand(commandName, interaction.client.prefixCommands, 'prefix');
      let reloadedTypes = [];

      // If a slash command is found reload it
      if (nearestSlashCommand) {
        await reloadCommand(nearestSlashCommand, interaction);
        reloadedTypes.push('slash');
      }
      // If a prefix command is found reload it
      if (nearestPrefixCommand) {
        await reloadCommand(nearestPrefixCommand, interaction);
        reloadedTypes.push('prefix');
      }

      // Response message
      let responseMessage = `### Reloaded commands:\n`;
      // If slash commands were reloaded, add its line to the response
      if (reloadedTypes.includes('slash')) responseMessage += `Slash: ${nearestSlashCommand ? nearestSlashCommand.data.name : 'none'}\n`;
      // If prefix commands were reloaded, add its line to the response
      if (reloadedTypes.includes('prefix')) responseMessage += `Prefix: ${nearestPrefixCommand ? nearestPrefixCommand.name : 'none'}`;
      // Indicate if no commands were reloaded
      if (reloadedTypes.length === 0) responseMessage = `No commands found with name '${commandName}'.`;
      await interaction.reply(responseMessage);
      logger.debug(`[Reload Command] Reload completed for command: ${commandName}`);
    } else {
      // Reload all commands of all types if no input is provided
      logger.debug('[Reload Command] No command provided. Reloading all commands.');
      await reloadAllCommands(interaction.client, 'slash');
      await reloadAllCommands(interaction.client, 'prefix');
      await interaction.reply('All commands were reloaded!');
      logger.debug('[Reload Command] All commands successfully reloaded.');
    }
  },
};

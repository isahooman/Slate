const { reloadAllCommands, reloadAllEvents } = require('../../../components/loader.js');
const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../components/logger.js');
const path = require('path');
const fs = require('fs');

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
      logger.debug(`[Reload Command] Attempting to reload command: ${commandName}`);
      // Search for commands by name within both command types
      const nearestSlashCommand = findNearestCommand(commandName, interaction.client.slashCommands, 'slash');
      const nearestPrefixCommand = findNearestCommand(commandName, interaction.client.prefixCommands, 'prefix');
      let reloadedTypes = [];

      // If a slash command is found reload it
      if (nearestSlashCommand) {
        logger.debug(`[Reload Command] Found slash command: ${nearestSlashCommand.data.name}`);
        await reloadCommand(nearestSlashCommand, interaction);
        reloadedTypes.push('slash');
      }
      // If a prefix command is found reload it
      if (nearestPrefixCommand) {
        logger.debug(`[Reload Command] Found prefix command: ${nearestPrefixCommand.name}`);
        await reloadCommand(nearestPrefixCommand, interaction);
        reloadedTypes.push('prefix');
      }

      let responseMessage = `### Reloaded commands for:\n`;
      if (reloadedTypes.includes('slash')) responseMessage += `Slash: ${nearestSlashCommand ? nearestSlashCommand.data.name : 'none'}\n`;
      if (reloadedTypes.includes('prefix')) responseMessage += `Prefix: ${nearestPrefixCommand ? nearestPrefixCommand.name : 'none'}`;
      if (reloadedTypes.length === 0) responseMessage = `No command found with name '${commandName}'.`;

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

/**
 * Search for command names based on "command" option input
 * @param {string} input - Input String, Command to search
 * @param {commands} commands - Collection of commands
 * @param {string} type - CommandType ('slash' or 'prefix')
 * @returns {object} - Command
 */
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

/**
 * Reload a specific command
 * @param {object} command Command object
 * @param {import("discord.js").Interaction} interaction Discord Interaction
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

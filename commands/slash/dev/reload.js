const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../util/logger');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command or all commands.')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to reload.')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('The type of commands to reload (slash, prefix).')
        .setRequired(false)
        .addChoices(
          { name: 'slash', value: 'slash' },
          { name: 'prefix', value: 'prefix' })),

  async execute(interaction) {
    const commandName = interaction.options.getString('command');

    // If a command is provided to the "command" option reload the commands with that name in both prefix and slash type collection
    if (commandName) {
      logger.debug(`Command name provided: ${commandName}`);

      // Find the nearest command name
      const nearestSlashCommand = findNearestCommand(commandName, interaction.client.slashCommands, 'slash');
      const nearestPrefixCommand = findNearestCommand(commandName, interaction.client.prefixCommands, 'prefix');

      // Reload found commands
      let reloadedTypes = [];

      if (nearestSlashCommand) {
        await reloadCommand(nearestSlashCommand, interaction);
        reloadedTypes.push('slash');
      }
      if (nearestPrefixCommand) {
        await reloadCommand(nearestPrefixCommand, interaction);
        reloadedTypes.push('prefix');
      }

      // Provide a response based on the reloaded command types
      if (reloadedTypes.length === 2) await interaction.reply(`Both slash and prefix command \`${commandName}\` have been reloaded.`);
      else if (reloadedTypes.length === 1) await interaction.reply(`${reloadedTypes[0]} command \`${commandName}\` has been reloaded.`);
      else await interaction.reply(`No command found with name '${commandName}'.`);
    } else {
      // Reload all slash and prefix commands
      await reloadAllCommands(interaction.client, 'slash');
      await reloadAllCommands(interaction.client, 'prefix');
      await interaction.reply('All commands were reloaded!');
    }
  },
};

// Reload specific commands
function reloadCommand(command, interaction) {
  const commandName = command.data ? command.data.name : command.name;
  logger.debug(`Reloading command: ${commandName}, Directory: ${command.directory}`);
  const commandPath = path.join(command.directory, `${commandName}.js`);

  // Delete the cached command information
  delete require.cache[require.resolve(commandPath)];

  try {
    // Require the newly loaded command
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

// Search for commands based on "command" option input
function findNearestCommand(input, commands, type) {
  let nearestCommand = null;
  let highestSimilarity = -1;

  commands.forEach((cmd, cmdName) => {
    let subIndex = 0;
    for (let i = 0; i < cmdName.length && subIndex < input.length; i++) if (cmdName[i] === input[subIndex]) subIndex++;
    if (subIndex === input.length) {
      const similarity = cmdName.length - input.length;
      if (similarity >= 0 && similarity > highestSimilarity) {
        highestSimilarity = similarity;
        nearestCommand = { ...cmd, type };
      }
    }
  });
  return nearestCommand;
}

// Reload all commands of a type when "type" option is provided
function reloadAllCommands(client, commandType) {
  logger.debug(`Reloading all ${commandType} commands`);
  const commands = commandType === 'slash' ? client.slashCommands : client.prefixCommands;
  const commandFiles = client.readCommands(path.join(__dirname, '..', '..', '..', 'commands', commandType));

  for (const fileData of commandFiles) {
    // Delete the cached version of the command
    delete require.cache[require.resolve(fileData.path)];
    try {
      // Require the newly loaded version
      const newCommand = require(fileData.path);
      const commandKey = commandType === 'slash' ? newCommand.data.name : newCommand.name.toLowerCase();
      commands.set(commandKey, newCommand);
      logger.debug(`Reloaded ${commandType} command: ${commandKey}`);
    } catch (error) {
      logger.error(`Error reloading ${commandType} command at ${fileData.path}: ${error.message}`);
    }
  }
}

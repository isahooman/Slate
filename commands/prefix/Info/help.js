const { ownerId, prefix } = require('../../../util/config.json');
const logger = require('../../../util/logger.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  category: 'info',
  description: 'Lists all available commands.',
  hdescription: 'Get help with commands!',
  usage: 'help [category/command]',
  execute(message, args, client) {
    try {
      // Create a new embed
      const embed = new EmbedBuilder()
        .setTitle('Commands')
        .setColor(0x0099ff);

      // Log who executed the 'help' command and in which server or DM it was executed
      logger.debug('Organizing commands by category');

      // Group commands by category
      const categories = new Map();
      client.prefixCommands.forEach(command => {
        if (command.category === 'owner' && message.author.id !== ownerId) return;

        const category = command.category || 'Uncategorized';
        if (!categories.has(category)) categories.set(category, []);
        categories.get(category).push(command);
      });

      // Get the argument provided in the command
      const arg = args[0];
      logger.debug(`Argument provided: ${arg}`);

      if (arg) {
        // Check if the user input matches a category
        logger.debug('Searching query');
        if (categories.has(arg)) {
          logger.debug(`Displaying commands for category: ${arg}`);
          const categoryCommands = categories.get(arg);
          const commandsString = categoryCommands.map(command => `\`${prefix}${command.name}\` - ${command.hdescription}`).join('\n');
          embed.addFields({ name: `${arg} Commands`, value: commandsString });
        } else {
          // Search for provided command and display the command specific help embed
          logger.debug('Searching for the nearest command');
          const foundCommand = findNearestCommand(client.prefixCommands, arg);

          if (foundCommand && (foundCommand.category !== 'owner' || message.author.id === ownerId)) {
            logger.debug(`Found command: ${foundCommand.name}`);
            embed.addFields(
              { name: `Command: ${foundCommand.name}`, value: foundCommand.description || 'No description available' },
              { name: 'Usage', value: `${prefix}${foundCommand.usage}` || 'No usage available' },
              { name: 'Category', value: foundCommand.category || 'Uncategorized' },
              { name: 'Description', value: foundCommand.hdescription || 'No detailed description available' },
            );
          } else {
            logger.warn(`No matching command found for search query: ${arg}`);
          }
        }
      } else {
        // Display all commands organized by category
        logger.debug('Displaying all commands');
        categories.forEach((commands, category) => {
          if (category === 'owner' && message.author.id !== ownerId) return;
          const commandsString = commands.map(command => `\`${prefix}${command.name}\` - ${command.hdescription}`).join('\n');
          embed.addFields({ name: `${category} Commands`, value: commandsString });
        });
      }

      // If no commands were found, set a default description in the embed
      if (!embed.data.fields.length) embed.setDescription('No commands found.');

      // Send the help embed
      logger.debug('Sending help embed');
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      logger.error(`An error occurred in the help command: ${error.message}`);
      message.channel.send('An error occurred while executing the help command.');
    }
  },
};

// Find the commannd with the name closest to the input
function findNearestCommand(commands, partialInput) {
  logger.debug(`findNearestCommand called with partialInput: ${partialInput}`);
  let nearestCommand = null;
  let shortestDistance = Infinity;

  commands.forEach(command => {
    if (command.name.toLowerCase().startsWith(partialInput.toLowerCase())) {
      const distance = command.name.length - partialInput.length;
      if (distance < shortestDistance) {
        nearestCommand = command;
        shortestDistance = distance;
      }
    }
  });

  if (nearestCommand) logger.debug(`Nearest command found: ${nearestCommand.name}`);
  else logger.debug('No nearest command found');
  return nearestCommand;
}

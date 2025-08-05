const logger = require('../../components/util/logger.js');
const { handleSlashCommand, handleInteraction } = require('../../components/commands/commandHandler.js');

module.exports = {
  name: 'interactionCreate',
  execute: async(interaction, client) => {
    logger.interaction(`Received interaction: ${interaction.id}, from: [${interaction.user.username}]`);

    // Check if the interaction is a command
    if (interaction.isCommand()) {
      logger.interaction(`Processing slash command: ${interaction.commandName}`);
      if (interaction.guild) logger.command(`Slash Command: ${interaction.commandName}, used by: ${interaction.user.username}, in: ${interaction.guild.name}`);
      else logger.command(`Slash Command: ${interaction.commandName}, used by: ${interaction.user.username}, in a Direct Message`);
      await handleSlashCommand(interaction, client);
      // Other interaction types
    } else if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
      await handleInteraction(interaction, client);
    } else {
      logger.warn(`Unknown interaction type received: ${interaction.type}`);
    }
  },
};

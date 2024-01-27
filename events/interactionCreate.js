const logger = require('../components/logger.js');

module.exports = {
  name: 'interactionCreate',
  execute: async(interaction, client) => {
    logger.info(`Received interaction: ${interaction.id}`);

    // Slash command handler
    if (!interaction.isCommand()) return;

    // Retrieve the command from the client's slashCommands collection
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
      logger.command(`Slash Command ${interaction.commandName} used by ${interaction.user.username} | ${interaction.user}`);
      logger.debug(`Processing slash command: ${interaction.commandName}`);
    } catch (error) {
      // Log errors in the slash command and send generic response
      logger.error(`Error executing slash command: ${error.message}`, client, 'slash', { interaction });
      if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this command.' }).catch(err => logger.error(`Error editing reply: ${err.message}`, client));
      else await interaction.reply({ content: 'An error occurred with this command.', ephemeral: false }).catch(err => logger.error(`Error sending error message: ${err.message}`, client));
    }
  },
};

const blacklist = require('../config/blacklist.json');
const logger = require('../components/logger.js');

module.exports = {
  name: 'interactionCreate',
  execute: async(interaction, client) => {
    logger.interaction(`Received interaction: ${interaction.id}`);

    // Check if the user is blacklisted
    if (blacklist.users.includes(interaction.user.id)) {
      logger.warn(`User ${interaction.user.username} (${interaction.user.id}) is in the blacklist. Ignoring interaction.`);
      return;
    }

    // Check if the server is leave blacklisted
    if (blacklist.servers.leave.includes(interaction.guildId)) {
      logger.warn(`Server ${interaction.guild.name} (${interaction.guildId}) is in the "leave" blacklist. Leaving server.`);
      await interaction.guild.leave();
      return;
    }

    // Check if the server is ignored
    if (blacklist.servers.ignore.includes(interaction.guildId)) {
      logger.warn(`Server ${interaction.guild.name} (${interaction.guildId}) is in the "ignore" blacklist. Ignoring interaction.`);
      return;
    }

    // Slash command handler
    if (!interaction.isCommand()) return;
    logger.command(`Slash Command ${interaction.commandName} used by ${interaction.user.username} | ${interaction.user}`);

    // Retrieve the command from the client's slashCommands collection
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
      logger.interaction(`Processing slash command: ${interaction.commandName}`);
    } catch (error) {
      // Log errors in the slash command and send generic response
      logger.error(`Error executing slash command: ${error.message}`, client, 'slash', { interaction });
      if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this command.' }).catch(err => logger.error(`Error editing reply: ${err.message}`, client));
      else await interaction.reply({ content: 'An error occurred with this command.', ephemeral: false }).catch(err => logger.error(`Error sending error message: ${err.message}`, client));
    }
  },
};

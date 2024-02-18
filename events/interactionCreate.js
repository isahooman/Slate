const blacklist = require('../config/blacklist.json');
const logger = require('../components/logger.js');
const { cooldown } = require('../bot.js');

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
    if (interaction.isCommand()) {
      logger.command(`Slash Command ${interaction.commandName} used by ${interaction.user.username} | ${interaction.user}`);

      // Retrieve the command from the client's slashCommands collection
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      // User Cooldown
      if (cooldown.user.enabled(command)) {
        logger.debug(`User Cooldown activated: ${command.data.name} by ${interaction.user.username}`);
        if (!cooldown.user.data.get(interaction.user.id)) cooldown.user.add(interaction.user.id, command);
        else if (cooldown.user.data.get(interaction.user.id) && cooldown.user.data.get(interaction.user.id).cooldowns.find(x =>
          x.name === command.data.name).time > Date.now()) return interaction.reply('You still have a cooldown on this command');
      }

      // Guild Cooldown
      if (cooldown.guild.enabled(command)) {
        logger.debug(`Guild Cooldown activated: ${command.data.name} in ${interaction.guild.name} by ${interaction.user.username}`);
        if (!cooldown.guild.data.get(interaction.guild.id)) cooldown.guild.add(interaction.guild.id, command);
        else if (cooldown.guild.data.get(interaction.guild.id) && cooldown.guild.data.get(interaction.guild.id).cooldowns.find(x =>
          x.name === command.data.name).time > Date.now()) return interaction.reply('The guild still has a cooldown on this command');
      }

      // Global Cooldown
      if (cooldown.global.enabled(command)) {
        logger.debug(`Global Cooldown activated: ${command.data.name} by ${interaction.user.username}`);
        if (!cooldown.global.get(command)) cooldown.global.add(command);
        else if (cooldown.global.get(command) && cooldown.global.get(command).cooldowns.find(x =>
          x.name === command.data.name).time > Date.now()) return interaction.reply('This command is still on cooldown globally');
      }

      try {
        await command.execute(interaction, client);
        logger.interaction(`Processing slash command: ${interaction.commandName}`);
      } catch (error) {
        // Log errors in the slash command and send generic response
        logger.error(`Error executing slash command: ${error.interaction}`, client, 'slash', { interaction });
        if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this command.' }).catch(err => logger.error(`Error editing reply: ${err.interaction}`, client));
        else await interaction.reply({ content: 'An error occurred with this command.', ephemeral: false }).catch(err => logger.error(`Error sending error interaction: ${err.interaction}`, client));
      }
    } else if (interaction.isButton()) {
      const button = client.slashCommands.get(interaction.message.interaction.commandName);
      if (!button) return logger.error(`Button interaction ${interaction.customId} was used by ${interaction.user.username} but the command was not found`, client, 'button', { interaction });
      try {
        await button.executeButton(interaction, client);
        logger.interaction(`Processing button interaction: ${interaction.customId}`);
      } catch (error) {
        logger.error(`Error executing button interaction: ${error.interaction}`, client, 'button', { interaction });
        if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this button.' }).catch(err => logger.error(`Error editing reply: ${err.interaction}`, client));
        else await interaction.reply({ content: 'An error occurred with this button.', ephemeral: false }).catch(err => logger.error(`Error sending error interaction: ${err.interaction}`, client));
      } finally {
        logger.interaction(`Button interaction ${interaction.customId} was used by ${interaction.user.username}`);
      }
    } else if (interaction.isStringSelectMenu()) {
      const stringSelectMenu = client.slashCommands.get(interaction.message.interaction.commandName);
      if (!stringSelectMenu) return logger.error(`String select menu interaction ${interaction.customId} was used by ${interaction.user.username} but the command was not found`, client, 'select', { interaction });
      try {
        await stringSelectMenu.executeStringSelectMenu(interaction, client);
        logger.interaction(`Processing string select menu interaction: ${interaction.customId}`);
      } catch (error) {
        logger.error(`Error executing select interaction: ${error.interaction}`, client, 'select', { interaction });
        if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this select menu.' }).catch(err => logger.error(`Error editing reply: ${err.interaction}`, client));
        else await interaction.reply({ content: 'An error occurred with this string select menu.', ephemeral: false }).catch(err => logger.error(`Error sending error interaction: ${err.interaction}`, client));
      } finally {
        logger.interaction(`String select menu interaction ${interaction.customId} was used by ${interaction.user.username}`);
      }
    } else if (interaction.isModalSubmit()) {
      const modalSubmit = client.slashCommands.get(interaction.message.interaction.commandName);
      if (!modalSubmit) return logger.error(`Modal submit interaction ${interaction.customId} was used by ${interaction.user.username} but the command was not found`, client, 'modal', { interaction });
      try {
        await modalSubmit.executeModalSubmit(interaction, client);
        logger.interaction(`Processing modal submit interaction: ${interaction.customId}`);
      } catch (error) {
        logger.error(`Error executing modal submit interaction: ${error.interaction}`, client, 'modal', { interaction });
        if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this modal.' }).catch(err => logger.error(`Error editing reply: ${err.interaction}`, client));
        else await interaction.reply({ content: 'An error occurred with this modal.', ephemeral: false }).catch(err => logger.error(`Error sending error interaction: ${err.interaction}`, client));
      } finally {
        logger.interaction(`Modal submit interaction ${interaction.customId} was used by ${interaction.user.username}`);
      }
    }
  },
};

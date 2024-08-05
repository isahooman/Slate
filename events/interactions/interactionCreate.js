const blacklist = require('../../config/blacklist.json');
const { logger } = require('../../components/loggerUtil.js');
const { cooldown } = require('../../bot');
const path = require('path');
const { readJSON5 } = require('../../components/json5Parser.js');
const { ownerId } = readJSON5(path.join(__dirname, '../../config/config.json5'));
const toggle = readJSON5(path.join(__dirname, '../../config/commands.json5'));

module.exports = {
  name: 'interactionCreate',
  execute: async(interaction, client) => {
    logger.interaction(`Received interaction: ${interaction.id}, from: [${interaction.user.username}]`);

    // Check if the user is blacklisted
    if (blacklist.users.includes(interaction.user.id)) {
      logger.warn(`User ${interaction.user.username} (${interaction.user.id}) is in the blacklist. Ignoring interaction.`);
      return;
    }
    // Check if the server is blacklisted
    if (blacklist.servers.leave.includes(interaction.guildId)) {
      logger.warn(`Server ${interaction.guild.name} (${interaction.guildId}) is in the "leave" blacklist. Leaving server.`);
      await interaction.guild.leave();
      return;
    }
    // Check if the server is ignored
    if (blacklist.servers.ignore.includes(interaction.guildId)) {
      logger.warn(`Server ${interaction.guild.name} (${interaction.guild.id}) is in the "ignore" blacklist. Ignoring interaction.`);
      return;
    }

    if (interaction.isCommand()) {
      logger.interaction(`Processing slash command: ${interaction.commandName}`);
      if (interaction.guild) logger.command(`Slash Command: ${interaction.commandName}, used by: ${interaction.user.username}, in: ${interaction.guild.name}`);
      else logger.command(`Slash Command: ${interaction.commandName}, used by: ${interaction.user.username}, in a Direct Message`);

      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      // Get the command category, defaulting to the directory name if not specified
      const commandCategory = command.category || path.basename(path.dirname(command.filePath));

      // Disabled check
      if (!ownerId.includes(interaction.user.id) && (!toggle.slash[interaction.commandName] || !toggle.slash[interaction.commandName])) return interaction.reply({
        content: 'This command has been disabled, possibly for maintenance.\nTry the prefix variation if it exists.',
      });

      // Owner-only command check
      if (commandCategory.toLowerCase() === 'owner' && !ownerId.includes(interaction.user.id)) {
        logger.debug(`Unauthorized attempt to use owner command: ${interaction.commandName}`);
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }

      // User Cooldown
      if (cooldown.user.enabled(command)) {
        logger.debug(`User Cooldown activated: ${command.data.name}, by: ${interaction.user.username}`);
        if (!cooldown.user.data.get(interaction.user.id)) cooldown.user.add(interaction.user.id, command);
        else if (cooldown.user.data.get(interaction.user.id) && cooldown.user.data.get(interaction.user.id).cooldowns.find(x => x.name === command.data.name).time > Date.now()) return interaction.reply('You still have a cooldown on this command');
      }

      // Guild Cooldown
      if (cooldown.guild.enabled(command)) {
        logger.debug(`Guild Cooldown activated: ${command.data.name}, in ${interaction.guild.name}, by: ${interaction.user.username}`);
        if (!cooldown.guild.data.get(interaction.guild.id)) cooldown.guild.add(interaction.guild.id, command);
        else if (cooldown.guild.data.get(interaction.guild.id) && cooldown.guild.data.get(interaction.guild.id).cooldowns.find(x => x.name === command.data.name).time > Date.now()) return interaction.reply('The guild still has a cooldown on this command');
      }

      // Global Cooldown
      if (cooldown.global.enabled(command)) {
        logger.debug(`Global Cooldown activated: ${command.data.name}, by: ${interaction.user.username}`);
        if (!cooldown.global.get(command)) cooldown.global.add(command);
        else if (cooldown.global.get(command) && cooldown.global.get(command).cooldowns.find(x => x.name === command.data.name).time > Date.now()) return interaction.reply('This command is still on cooldown globally');
      }

      try {
        await command.execute(interaction, client, commandCategory);
      } catch (error) {
        logger.error(`Error executing slash command: ${error}\n${error.stack}`, 'slash', { interaction });
        if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this command.' }).catch(err => logger.error(`Error editing reply: ${err}`));
        else await interaction.reply({ content: 'An error occurred with this command.', ephemeral: false }).catch(err => logger.error(`Error sending error interaction: ${err}`));
      }
    } else if (interaction.isButton()) {
      logger.interaction(`Processing button interaction: ${interaction.customId}`);
      const button = client.slashCommands.get(interaction.message.interaction.commandName);
      if (!button) return logger.error(`Button interaction: ${interaction.customId}, was used by: ${interaction.user.username}, but the command was not found`, 'button', { interaction });

      try {
        await button.executeButton(interaction, client);
      } catch (error) {
        logger.error(`Error executing button interaction: ${error.interaction}`, 'button', { interaction });
        if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this button.' }).catch(err => logger.error(`Error editing reply: ${err.interaction}`));
        else await interaction.reply({ content: 'An error occurred with this button.', ephemeral: false }).catch(err => logger.error(`Error sending error interaction: ${err.interaction}`));
      } finally {
        logger.interaction(`Button interaction: ${interaction.customId}, was used by: ${interaction.user.username}`);
      }
    } else if (interaction.isStringSelectMenu()) {
      logger.interaction(`Processing string select menu interaction: ${interaction.customId}`);
      const stringSelectMenu = client.slashCommands.get(interaction.message.interaction.commandName);
      if (!stringSelectMenu) return logger.error(`String select menu interaction: ${interaction.customId}, was used by: ${interaction.user.username}, but the command was not found`, 'select', { interaction });

      try {
        await stringSelectMenu.executeStringSelectMenu(interaction, client);
      } catch (error) {
        logger.error(`Error executing select interaction: ${error.interaction}`, 'select', { interaction });
        if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this select menu.' }).catch(err => logger.error(`Error editing reply: ${err.interaction}`));
        else await interaction.reply({ content: 'An error occurred with this string select menu.', ephemeral: false }).catch(err => logger.error(`Error sending error interaction: ${err.interaction}`));
      } finally {
        logger.interaction(`String select menu interaction: ${interaction.customId}, was used by: ${interaction.user.username}`);
      }
    } else if (interaction.isModalSubmit()) {
      logger.interaction(`Processing modal submit interaction: ${interaction.customId}`);
      const modalSubmit = client.slashCommands.get(interaction.message.interaction.commandName);
      if (!modalSubmit) return logger.error(`Modal submit interaction: ${interaction.customId}, was used by: ${interaction.user.username}, but the command was not found`, 'modal', { interaction });

      try {
        await modalSubmit.executeModalSubmit(interaction, client);
      } catch (error) {
        logger.error(`Error executing modal submit interaction: ${error.interaction}`, 'modal', { interaction });
        if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this modal.' }).catch(err => logger.error(`Error editing reply: ${err.interaction}`));
        else await interaction.reply({ content: 'An error occurred with this modal.', ephemeral: false }).catch(err => logger.error(`Error sending error interaction: ${err.interaction}`));
      } finally {
        logger.interaction(`Modal submit interaction: ${interaction.customId}, was used by: ${interaction.user.username}`);
      }
    }
  },
};

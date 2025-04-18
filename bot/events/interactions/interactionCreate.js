const logger = require('../../components/util/logger.js');
const { cooldown } = require('../../bot.js');
const path = require('path');
const configManager = require('../../../components/configManager');

module.exports = {
  name: 'interactionCreate',
  execute: async(interaction, client) => {
    logger.interaction(`Received interaction: ${interaction.id}, from: [${interaction.user.username}]`);

    const blacklist = configManager.loadConfig('blacklist');
    const ownerId = configManager.getConfigValue('config', 'ownerId', []);

    // Check if the user is blacklisted
    if (blacklist.users && blacklist.users.includes(interaction.user.id)) {
      logger.warn(`User ${interaction.user.username} (${interaction.user.id}) is in the blacklist. Ignoring interaction.`);
      return;
    }

    // Check if the server is blacklisted
    if (interaction.guild && blacklist.servers && blacklist.servers.leave && blacklist.servers.leave.includes(interaction.guildId)) {
      logger.warn(`Server ${interaction.guild.name} (${interaction.guildId}) is in the "leave" blacklist. Leaving server.`);
      await interaction.guild.leave();
      return;
    }

    // Check if the server is ignored
    if (interaction.guild && blacklist.servers && blacklist.servers.ignore && blacklist.servers.ignore.includes(interaction.guildId)) {
      logger.warn(`Server ${interaction.guild.name} (${interaction.guild.id}) is in the "ignore" blacklist. Ignoring interaction.`);
      return;
    }

    // Handle interaction commands
    if (interaction.isCommand()) {
      logger.interaction(`Processing slash command: ${interaction.commandName}`);
      if (interaction.guild) logger.command(`Slash Command: ${interaction.commandName}, used by: ${interaction.user.username}, in: ${interaction.guild.name}`);
      else logger.command(`Slash Command: ${interaction.commandName}, used by: ${interaction.user.username}, in a Direct Message`);

      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      // Get the command category, defaulting to the directory name if not specified
      const commandCategory = command.category || path.basename(path.dirname(command.filePath));

      // Disabled check
      const isCommandEnabled = configManager.getConfigValue('commands', `slash.${interaction.commandName}`, true);
      if (!ownerId.includes(interaction.user.id) && !isCommandEnabled) return interaction.reply({
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
      if (interaction.guild && cooldown.guild.enabled(command)) {
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
        logger.error(`${error.message.replace('Error: ', '')}`, 'slash', { interaction, stack: error.stack });
        if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this command.' }).catch(err => logger.error(`Error editing reply: ${err}`));
        else await interaction.reply({ content: 'An error occurred with this command.', ephemeral: false }).catch(err => logger.error(`Error sending error interaction: ${err}`));
      }
    } else if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
      // Determine which type of interaction
      const interactionType = interaction.isButton() ? 'button' : interaction.isStringSelectMenu() ? 'stringSelectMenu' : 'modalSubmit';
      const commandName = interaction.customId;

      logger.interaction(`Processing ${interactionType}: ${commandName}`);
      try {
        // Import the appropriate handler
        const handler = require(path.join(__dirname, '../../interactions', `${interactionType}s`, `${commandName}.js`));
        // Verify that the handler exports the expected function
        if (typeof handler[interactionType] !== 'function') throw new Error(`Handler for ${commandName} does not have a ${interactionType} function`);
        // Execute the handler with the interaction and client objects
        await handler[interactionType](interaction, client);
      } catch (error) {
        logger.error(`Error executing ${interactionType} interaction: ${error.message}`, interactionType, { interaction });
        interaction.reply('An error has occured with this interaction.').catch(err => logger.error(`Error sending error interaction: ${err.message}`));
      }
    } else {
      logger.warn(`Unknown interaction type received: ${interaction.type}`);
    }
  },
};

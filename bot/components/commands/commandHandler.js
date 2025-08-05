const logger = require('../util/logger.js');
const configManager = require('../../../components/configManager');
const createDisclaimerProxy = require('./commandWrapper.js');
const { cooldown } = require('../../bot.js');
const path = require('path');

/**
 * Checks if a user or server is blacklisted
 * @param {object} context - The message or interaction context
 * @returns {object} - { isBlacklisted: boolean, shouldLeave: boolean }
 * @author isahooman
 */
function checkBlacklist(context) {
  // If no context provided, skip checks
  if (!context) return { isBlacklisted: false, shouldLeave: false };

  try {
    // Load the blacklist
    const blacklist = configManager.loadConfig('blacklist');
    if (!blacklist) return { isBlacklisted: false, shouldLeave: false };

    // Get information from context
    const source = context.author || context.user;
    const guild = context.guild;

    let isBlacklisted = false;
    let shouldLeave = false;

    // Check user blacklist
    if (source && blacklist.users.includes(source.id)) {
      logger.warn(`User ${source.tag} (${source.id}) is blacklisted`);
      isBlacklisted = true;
    }

    // Check server blacklist if context contains a guild
    if (guild) if (blacklist.servers.leave.includes(guild.id)) {
      // Check if the server should be left
      logger.warn(`Server ${guild.name} (${guild.id}) is in "leave" blacklist`);
      shouldLeave = true;
      isBlacklisted = true;
    } else if (blacklist.servers.ignore.includes(guild.id)) {
      // Check if the server should be ignored
      logger.warn(`Server ${guild.name} (${guild.id}) is in "ignore" blacklist`);
      isBlacklisted = true;
    }

    return { isBlacklisted, shouldLeave };
  } catch (error) {
    logger.error(`Error checking blacklist: ${error.message}`);
    return { isBlacklisted: false, shouldLeave: false };
  }
}

/**
 * Centralized error handler for commands
 * @param {Error|any} error - The error that occurred
 * @param {object} context - Message or interaction object
 * @param {object} command - Command that was executed
 * @param {string} type - Command type ('prefix' or 'slash')
 * @returns {Promise<void>}
 * @author isahooman
 */
async function handleCommandError(error, context, command, type) {
  // Create a proper error object regardless of what was thrown
  const errorObject = error instanceof Error ? error : new Error(String(error || 'Unknown error'));

  // Gather command name and
  const commandName = type === 'prefix' ? command.name : command.data?.name || context.commandName;

  // Build command info for reporting
  const commandInfo = {
    command: commandName,
    stack: errorObject.stack,
    error: errorObject,
  };

  // Add prefix command info
  if (type === 'prefix') {
    commandInfo.context = context;
    commandInfo.args = context.args || [];
  } else {
    commandInfo.interaction = context;
  }

  // Log the error
  logger.error(`${errorObject.message}`, type, commandInfo);

  // Reply to the user
  try {
    if (type === 'prefix') {
      await context.reply('An error occurred with this command, the error has been reported to the developer.')
        .catch(replyError => {
          logger.error(`Failed to send error message: ${replyError.message}`);
        });
    } else {
      const errorMessage = { content: 'An error occurred with this command, the error has been reported to the developer' };
      if (context.replied || context.deferred) await context.editReply(errorMessage)
        .catch(editError => {
          logger.error(`Failed to edit reply: ${editError.message}`);
        });
      else await context.reply({ ...errorMessage, ephemeral: true })
        .catch(replyError => {
          logger.error(`Failed to send reply: ${replyError.message}`);
        });
    }
  } catch (replyError) {
    logger.error(`Failed to notify user about error: ${replyError.message}`);
  }
}

/**
 * Handles prefix commands from message events
 * @param {object} message - Discord Message
 * @param {object} client - Discord Client
 * @returns {Promise<void>} - Promise representing the completion of the command handling
 * @author isahooman
 */
async function handlePrefixCommand(message, client) {
  // Load config values once
  const config = configManager.loadConfig('config');
  const ownerId = config.ownerId || [];
  const prefix = config.prefix;
  const commandsConfig = configManager.loadConfig('commands');

  // Check blacklist
  const { isBlacklisted, shouldLeave } = checkBlacklist(message);
  if (isBlacklisted) {
    if (shouldLeave && message.guild) {
      logger.warn(`Leaving blacklisted server: ${message.guild.name}`);
      await message.guild.leave();
    }
    return;
  }

  // Handle mentions
  const mention = new RegExp(`^<@!?${client.user.id}>$`);
  const mentionWithCommand = new RegExp(`^<@!?${client.user.id}> `);

  if (mention.test(message.content)) return message.reply(prefix ? `My prefix is \`${prefix}\`` : `No prefix set`);

  // Check command prefix or mention
  const isMention = mentionWithCommand.test(message.content);
  const hasValidPrefix = prefix && message.content.startsWith(prefix);

  // Return if message doesn't start with prefix (if defined) and isn't a mention
  if (!hasValidPrefix && !isMention) return;

  // Parse command and args
  let content;
  if (isMention) content = message.content.replace(mentionWithCommand, '');
  else if (hasValidPrefix) content = message.content.slice(prefix.length);
  else return; // Safety check

  const args = content.split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Find command
  const command = client.prefixCommands.get(commandName) || client.commandAliases.get(commandName);
  if (!command) return;

  // Check if command is disabled
  const isCommandDisabled = commandsConfig?.[`prefix.${command.name.toLowerCase()}`] === false;
  if (isCommandDisabled && !ownerId.includes(message.author.id)) return;

  // Apply disclaimer for owner using disabled commands
  let processedMessage = message;
  if (isCommandDisabled && ownerId.includes(message.author.id)) processedMessage = createDisclaimerProxy(message);

  // Permission checks
  if (command.category.toLowerCase() === 'owner' && !ownerId.includes(message.author.id)) return;
  if (command.nsfw && !message.channel.nsfw) return message.reply('This command can only be used in NSFW channels.');

  // DM checks
  const allowDM = command.allowDM !== undefined ? command.allowDM : false;
  if (!message.guild && !allowDM && command.category.toLowerCase() !== 'owner') return message.reply('This command cannot be used in DMs.');

  // Check cooldowns
  if (!handleCooldowns(processedMessage, command, 'prefix')) return;

  // Execute command
  try {
    logger.command(`Prefix Command: ${command.name}, used by: ${message.author.tag}`);
    await command.execute(processedMessage, args, client);
  } catch (error) {
    // Store args on message object to pass to error handler
    processedMessage.args = args;
    await handleCommandError(error, processedMessage, command, 'prefix');
  }
}

/**
 * Handles slash commands from interaction events
 * @param {object} interaction - The interaction object from Discord.js
 * @param {object} client - The Discord.js client instance
 * @returns {Promise<void>} - Promise representing the completion of the command handling
 * @author isahooman
 */
async function handleSlashCommand(interaction, client) {
  // Load config values once
  const config = configManager.loadConfig('config');
  const ownerId = config.ownerId || [];
  const commandsConfig = configManager.loadConfig('commands');

  // Check blacklist
  const { isBlacklisted, shouldLeave } = checkBlacklist(interaction);
  if (isBlacklisted) {
    if (shouldLeave && interaction.guild) {
      logger.warn(`Leaving blacklisted server: ${interaction.guild.name}`);
      await interaction.guild.leave();
    }
    return;
  }

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  // Make sure category is consistently defined
  const commandCategory = command.category ||
    (command.filePath ? path.basename(path.dirname(command.filePath)) : 'uncategorized');

  // Check if command is disabled
  const isCommandEnabled = commandsConfig?.[`slash.${interaction.commandName}`] !== false;
  if (!ownerId.includes(interaction.user.id) && !isCommandEnabled) return interaction.reply({
    content: 'This command is currently disabled.',
    ephemeral: true,
  });

  // Permission checks
  if (commandCategory.toLowerCase() === 'owner' && !ownerId.includes(interaction.user.id)) return interaction.reply({
    content: 'You do not have permission to use this command.',
    ephemeral: true,
  });

  if (command.nsfw && interaction.channel && !interaction.channel.nsfw) return interaction.reply({
    content: 'This command can only be used in NSFW channels.',
    ephemeral: true,
  });

  // Check cooldowns
  if (!handleCooldowns(interaction, command, 'slash')) return;

  // Execute command
  try {
    await command.execute(interaction, client, commandCategory);
  } catch (error) {
    await handleCommandError(error, interaction, command, 'slash');
  }
}

/**
 * Validates if a command name is safe to use in a file path
 * @param {string} name - Command name to validate
 * @returns {boolean} - Whether the name is safe
 * @author isahooman
 */
function isValidCommandName(name) {
  // Only allow alphanumeric characters, hyphens and underscores
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

/**
 * Handles component interactions (buttons, select menus, modals)
 * @param {object} interaction - The interaction object from Discord.js
 * @param {object} client - The Discord.js client instance
 * @returns {Promise<void>} - Promise representing the completion of the interaction handling
 */
async function handleInteraction(interaction, client) {
  // Check blacklist
  const { isBlacklisted, shouldLeave } = checkBlacklist(interaction);
  if (isBlacklisted) {
    if (shouldLeave && interaction.guild) {
      logger.warn(`Leaving blacklisted server: ${interaction.guild.name}`);
      await interaction.guild.leave();
    }
    return;
  }

  // Determine interaction type
  const interactionType = interaction.isButton() ? 'button' :
    interaction.isStringSelectMenu() ? 'stringSelectMenu' : 'modalSubmit';

  // Extract command name and validate it
  const commandParts = interaction.customId.split('.');
  const commandName = commandParts[0];

  // Security: Validate command name to prevent path traversal
  if (!isValidCommandName(commandName)) {
    logger.error(`Invalid component command name: ${commandName}`);
    if (!interaction.replied && !interaction.deferred) await interaction.reply({
      content: 'Invalid interaction.',
      ephemeral: true,
    }).catch(error => logger.error(`Failed to reply to invalid interaction: ${error.message}`));

    return;
  }

  logger.interaction(`Processing ${interactionType}: ${commandName}`);

  try {
    // Import handler with validated path
    const handlerPath = path.join(__dirname, '../../interactions', `${interactionType}s`, `${commandName}.js`);
    const handler = require(handlerPath);

    if (typeof handler[interactionType] !== 'function') throw new Error(`Invalid handler for ${commandName}`);

    await handler[interactionType](interaction, client);
  } catch (error) {
    logger.error(`${interactionType} error: ${error.message}`);

    // Check if we can reply
    if (!interaction.replied && !interaction.deferred) try {
      await interaction.reply({
        content: 'An error occurred with this interaction.',
        ephemeral: true,
      });
    } catch (replyError) {
      logger.error(`Failed to send reply: ${replyError.message}`);
    }
  }
}

/**
 * Handles cooldowns for commands
 * @param {object} context - The message or interaction context
 * @param {object} command - The command object
 * @param {string} type - The type of command ('prefix' or 'slash')
 * @returns {boolean} - Whether the command can proceed (true) or is on cooldown (false)
 * @author isahooman
 */
function handleCooldowns(context, command, type) {
  const userId = type === 'prefix' ? context.author.id : context.user.id;
  const guildId = context.guild?.id;
  const commandName = type === 'prefix' ? command.name : command.data.name;

  const replyMethod = type === 'prefix' ?
    msg => context.reply(msg) :
    msg => context.reply({ content: msg, ephemeral: true });

  // Check user cooldown
  if (cooldown.user.enabled(command)) if (!cooldown.user.data.get(userId)) {
    cooldown.user.add(userId, command);
  } else {
    const userCooldowns = cooldown.user.data.get(userId).cooldowns;
    const cmdCooldown = userCooldowns.find(x => x.name === commandName);

    if (cmdCooldown?.time > Date.now()) {
      replyMethod('You still have a cooldown on this command');
      return false;
    }
  }

  // Check guild cooldown
  if (guildId && cooldown.guild.enabled(command)) if (!cooldown.guild.data.get(guildId)) {
    cooldown.guild.add(guildId, command);
  } else {
    const guildCooldowns = cooldown.guild.data.get(guildId).cooldowns;
    const cmdCooldown = guildCooldowns.find(x => x.name === commandName);

    if (cmdCooldown?.time > Date.now()) {
      replyMethod('The guild still has a cooldown on this command');
      return false;
    }
  }

  // Check global cooldown
  if (cooldown.global.enabled(command)) if (!cooldown.global.get(command)) {
    cooldown.global.add(command);
  } else {
    const globalCooldowns = cooldown.global.get(command).cooldowns;
    const cmdCooldown = globalCooldowns.find(x => x.name === commandName);

    if (cmdCooldown?.time > Date.now()) {
      replyMethod('This command is still on cooldown globally');
      return false;
    }
  }

  return true;
}

module.exports = {
  handlePrefixCommand,
  handleSlashCommand,
  handleInteraction,
};

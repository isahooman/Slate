const { cooldown } = require('../../bot.js');
const logger = require('../../components/util/logger.js');
const configManager = require('../../../components/configManager');
const createDisclaimerProxy = require('../../components/commands/commandWrapper.js');

module.exports = {
  name: 'messageCreate',
  execute: async(message, client) => {
    let messageContent = message.content.split('\n').map(line => `│ ${line}`).join('\n');

    // Calculate the message width for border
    let maxLength = Math.max(...message.content.split('\n').map(line => line.length));
    const indicatorWidth = 15;

    // Check for attachments
    const hasAttachments = message.attachments.size > 0;
    const isOnlyAttachment = hasAttachments && message.content.trim() === '';
    if (hasAttachments) messageContent += isOnlyAttachment ? '[attachment]' : '\n│ [attachment]'.slice(0, indicatorWidth);

    // Check for embeds
    const hasEmbeds = message.embeds.length > 0;
    const isOnlyEmbed = hasEmbeds && message.content.trim() === '';
    if (hasEmbeds) messageContent += isOnlyEmbed ? '[embed]' : '\n│ [embed]'.slice(0, indicatorWidth);

    // Adjust maxLength for indicators
    maxLength = Math.max(...messageContent.split('\n').map(line => line.length));

    // Build the border
    const borderChar = '─';
    const borderLength = Math.max(maxLength + 2, indicatorWidth + 2);
    const border = borderChar.repeat(borderLength);

    logger.message(`Processing new message from: [${message.author.tag}]:\n╭${border}╮\n${messageContent}\n╰${border}╯`);

    // Load config
    const blacklist = configManager.loadConfig('blacklist');
    const prefix = configManager.getConfigValue('config', 'prefix', '!');
    const ownerId = configManager.getConfigValue('config', 'ownerId', []);

    // Check if the user is blacklisted
    if (blacklist.users && blacklist.users.includes(message.author.id)) {
      logger.warn(`User ${message.author.tag} (${message.author.id}) is in the blacklist. Ignoring message.`);
      return;
    }

    // Check if server is blacklisted
    if (message.guild && blacklist.servers && blacklist.servers.leave && blacklist.servers.leave.includes(message.guild.id)) {
      logger.warn(`Server ${message.guild.name} (${message.guild.id}) is in the "leave" blacklist. Leaving server.`);
      await message.guild.leave();
      return;
    }

    // Check if the server is ignored
    if (message.guild && blacklist.servers && blacklist.servers.ignore && blacklist.servers.ignore.includes(message.guild.id)) {
      logger.warn(`Server ${message.guild.name} (${message.guild.id}) is in the "ignore" blacklist. Ignoring message.`);
      return;
    }

    // Ignore messages from bots
    if (message.author.bot) {
      logger.debug('Ignoring bot message.');
      return;
    }

    // check message for mention
    const mention = new RegExp(`^<@!?${client.user.id}>$`);
    const mentionWithCommand = new RegExp(`^<@!?${client.user.id}> `);
    if (mention.test(message.content)) {
      logger.info(`Bot mentioned by: ${message.author.tag}`);
      return message.reply(`My prefix is \`${prefix}\``);
    }

    // Check message for prefix or mention
    if (!message.content.startsWith(prefix) && !mentionWithCommand.test(message.content)) {
      logger.debug('Message does not start with prefix or mention.');
      return;
    }

    const content = message.content.startsWith(prefix) ? message.content.slice(prefix.length) : message.content.replace(mentionWithCommand, '');
    let args = content.split(/ +/);

    let commandName = args.shift().toLowerCase();

    // Check message for command or command alises
    const command = client.prefixCommands.get(commandName) || client.commandAliases.get(commandName);
    if (!command) {
      logger.debug(`Command not found: ${commandName}`);
      return;
    }

    // Check if the command is disabled
    const isCommandDisabled = configManager.getConfigValue('commands', `prefix.${command.name.toLowerCase()}`, true) === false;
    if (isCommandDisabled) {
      // If not owner, do nothing
      if (!ownerId.includes(message.author.id)) return;

      // If owner, continue but add disclaimer
      logger.info(`Owner ${message.author.tag} bypassing disabled command: ${command.name.toLowerCase()} with disclaimer`);
      message = createDisclaimerProxy(message);
    }

    // Owner-only commands
    if (command.category.toLowerCase() === 'owner' && !ownerId.includes(message.author.id)) {
      logger.debug(`Unauthorized attempt to use owner command: ${commandName}`);
      return;
    }

    // NSFW check
    if (command.nsfw && !message.channel.nsfw) {
      logger.debug(`NSFW command used in non-NSFW channel: ${commandName}`);
      return;
    }

    // Check if the command is allowed in DMs
    const allowDM = command.allowDM !== undefined ? command.allowDM : false;
    if (!message.guild && !allowDM && command.category.toLowerCase() !== 'owner') {
      logger.debug(`Command: ${commandName}, is not allowed in DMs.`);
      return;
    }

    // User Cooldown
    if (cooldown.user.enabled(command)) {
      logger.debug(`User Cooldown activated: ${commandName}, by: ${message.author.tag}`);
      if (!cooldown.user.data.get(message.author.id)) cooldown.user.add(message.author.id, command);
      else if (cooldown.user.data.get(message.author.id) && cooldown.user.data.get(message.author.id).cooldowns.find(x =>
        x.name === command.name) && cooldown.user.data.get(message.author.id).cooldowns.find(x =>
        x.name === command.name).time > Date.now()) return message.reply('You still have a cooldown on this command');
    }

    // Guild Cooldown
    if (message.guild && cooldown.guild.enabled(command)) {
      logger.debug(`Guild Cooldown activated: ${commandName}, in: ${message.guild.name}, by: ${message.author.tag}`);
      if (!cooldown.guild.data.get(message.guild.id)) cooldown.guild.add(message.guild.id, command);
      else if (cooldown.guild.data.get(message.guild.id) && cooldown.guild.data.get(message.guild.id).cooldowns.find(x =>
        x.name === command.name).time > Date.now()) return message.reply('The guild still has a cooldown on this command');
    }

    // Global Cooldown
    if (cooldown.global.enabled(command)) {
      logger.debug(`Global Cooldown activated: ${commandName}, by: ${message.author.tag}`);
      if (!cooldown.global.get(command)) cooldown.global.add(command);
      else if (cooldown.global.get(command) && cooldown.global.get(command).cooldowns.find(x =>
        x.name === command.name).time > Date.now()) return message.reply('This command is still on cooldown globally');
    }

    try {
      logger.command(`Prefix Command: ${command.name}, used by: ${message.author.tag}, in: ${message.guild ? message.guild.name : 'DMs'}`);
      await command.execute(message, args, client);
    } catch (error) {
      logger.error(`${error.message.replace('Error: ', '')}`, 'prefix', {
        context: message,
        args: [command.name, ...args],
        command: command.name,
        stack: error.stack,
      });
      // Reply to the user with a generic error message
      await message.reply({
        content: 'An error occurred with this command.',
      }).catch(err => logger.error(`Reply error: ${err.message}`));
    }
  },
};

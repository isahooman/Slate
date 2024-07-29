const blacklist = require('../../config/blacklist.json');
const { logger } = require('../../components/loggerUtil.js');
const { cooldown } = require('../../bot.js');
const path = require('path');
const { readJSON5 } = require('../../components/json5Parser.js');
const { prefix, ownerId } = readJSON5(path.join(__dirname, '../../config/config.json5'));
const commands = readJSON5(path.join(__dirname, '../../config/commands.json5'));

module.exports = {
  name: 'messageUpdate',
  execute: async(oldMessage, newMessage, client) => {
    let messageContent = newMessage.content.split('\n').map(line => `│ ${line}`).join('\n');

    // Calculate the message width for border
    const maxLength = Math.max(...newMessage.content.split('\n').map(line => line.length));
    const indicatorWidth = 15;

    // Build the border
    const borderChar = '─';
    const borderLength = Math.max(maxLength + 4, indicatorWidth + 0);
    const border = borderChar.repeat(borderLength);

    // Check for attachments
    const hasAttachments = newMessage.attachments.size > 0;
    const isOnlyAttachment = hasAttachments && newMessage.content.trim() === '';
    if (hasAttachments) messageContent += isOnlyAttachment ? '[attachment]' : '\n│ [attachment]'.slice(0, indicatorWidth);

    // Check for embeds
    const hasEmbeds = newMessage.embeds.length > 0;
    const isOnlyEmbed = hasEmbeds && newMessage.content.trim() === '';
    if (hasEmbeds) messageContent += isOnlyEmbed ? '[embed]' : '\n│ [embed]'.slice(0, indicatorWidth);

    logger.message(`Processing new message from: [${newMessage.author.tag}]:\n╭${border}╮\n${messageContent}\n╰${border}╯`);

    // Check if the user is blacklisted
    if (blacklist.users.includes(newMessage.author.id)) {
      logger.warn(`User ${newMessage.author.tag} (${newMessage.author.id}) is in the blacklist. Ignoring message.`);
      return;
    }

    // Check if server is blacklisted
    if (newMessage.guild && blacklist.servers.leave.includes(newMessage.guild.id)) {
      logger.warn(`Server ${newMessage.guild.name} (${newMessage.guild.id}) is in the "leave" blacklist. Leaving server.`);
      await newMessage.guild.leave();
      return;
    }

    // Check if the server is ignored
    if (newMessage.guild && blacklist.servers.ignore.includes(newMessage.guild.id)) {
      logger.warn(`Server ${newMessage.guild.name} (${newMessage.guild.id}) is in the "ignore" blacklist. Ignoring message.`);
      return;
    }

    if (newMessage.author.bot) {
      logger.debug('Ignoring bot message.');
      return;
    }

    // Check if the updated message mentions the bot
    const mention = new RegExp(`^<@!?${client.user.id}>$`);
    const mentionWithCommand = new RegExp(`^<@!?${client.user.id}> `);

    // Respond to mentions without a command with the bot's prefix
    if (mention.test(newMessage.content)) {
      logger.message(`Bot mentioned by ${newMessage.author.tag} in channel ${newMessage.channel.id}`);
      return newMessage.reply(`My prefix is \`${prefix}\``);
    }

    // Check if the message starts with the prefix or mentions the bot
    const isMention = mentionWithCommand.test(newMessage.content);
    if (!newMessage.content.startsWith(prefix) && !isMention) {
      logger.debug(`Message does not start with prefix or mention.`);
      return;
    }

    // Extract the command and arguments from the updated message
    const content = isMention ?
      newMessage.content.replace(mentionWithCommand, '') :
      newMessage.content.slice(prefix.length);
    const args = content.trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check if the command name is an alias
    const command = client.prefixCommands.get(commandName) || client.commandAliases.get(commandName);

    // Ignore unknown commands
    if (!command) {
      logger.debug(`No command found for: ${commandName}`);
      return;
    }

    // Restrict owner-only commands
    if (command.category.toLowerCase() === 'owner' && !ownerId.includes(newMessage.author.id)) {
      logger.debug(`Unauthorized attempt to use owner command: ${commandName} by ${newMessage.author.tag}`);
      return;
    }

    // Check if command is disabled unless the user is an owner
    if (!ownerId.includes(newMessage.author.id) && (commands.prefix[commandName] === false)) return newMessage.reply('This command has been disabled, possibly for maintenance.\nTry the slash variation if it exists.');

    // Check if the command is NSFW and if it was used within an NSFW channel
    if (command.nsfw && !newMessage.channel.nsfw) {
      logger.debug(`NSFW command used in non-NSFW channel: ${commandName}`);
      return;
    }

    // Check if the command is allowed in DMs
    const allowDM = command.allowDM !== undefined ? command.allowDM : false;
    if (!newMessage.guild && !allowDM && command.category.toLowerCase() !== 'owner') {
      logger.debug(`Command: ${commandName}, is not allowed in DMs.`);
      return;
    }

    // User Cooldown
    if (cooldown.user.enabled(command)) {
      logger.debug(`User Cooldown activated: ${commandName} by ${newMessage.author.tag}`);
      if (!cooldown.user.data.get(newMessage.author.id)) cooldown.user.add(newMessage.author.id, command);
      else if (cooldown.user.data.get(newMessage.author.id) && cooldown.user.data.get(newMessage.author.id).cooldowns.find(x =>
        x.name === command.name).time > Date.now()) return newMessage.reply('You still have a cooldown on this command');
    }

    // Guild Cooldown
    if (newMessage.guild && cooldown.guild.enabled(command)) {
      logger.debug(`Guild Cooldown activated: ${commandName}, in: ${newMessage.guild.name}, by: ${newMessage.author.tag}`);
      if (!cooldown.guild.data.get(newMessage.guild.id)) cooldown.guild.add(newMessage.guild.id, command);
      else if (cooldown.guild.data.get(newMessage.guild.id) && cooldown.guild.data.get(newMessage.guild.id).cooldowns.find(x =>
        x.name === command.name).time > Date.now()) return newMessage.reply('The guild still has a cooldown on this command');
    }

    // Global Cooldown
    if (cooldown.global.enabled(command)) {
      logger.debug(`Global Cooldown activated: ${commandName}, by: ${newMessage.author.tag}`);
      if (!cooldown.global.get(command)) cooldown.global.add(command);
      else if (cooldown.global.get(command) && cooldown.global.get(command).cooldowns.find(x =>
        x.name === command.name).time > Date.now()) return newMessage.reply('This command is still on cooldown globally');
    }

    try {
      logger.command(`Prefix Command ${command.name} used by: ${newMessage.author.tag}, in ${newMessage.guild ? newMessage.guild.name : 'DMs'}`);
      await command.execute(newMessage, args, client);
    } catch (error) {
      logger.error(`${error.stack}`, 'prefix', {
        context: newMessage,
        args: [command.name, ...args],
        command: command.name,
      });

      // Reply to the user with generic error message
      await newMessage.reply({
        content: 'An error occurred with this command.',
        allowedMentions: { repliedUser: false },
      }).catch(err => logger.error(`Reply error: ${err.message}`));
    }
  },
};

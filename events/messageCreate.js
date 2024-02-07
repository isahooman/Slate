const blacklist = require('../config/blacklist.json');
const { prefix } = require('../config/config.json');
const logger = require('../components/logger.js');
const { cooldown } = require('../bot.js');

module.exports = {
  name: 'messageCreate',
  execute: async(message, client) => {
    logger.message('Processing new message..');

    // Check if the user is blacklisted
    if (blacklist.users.includes(message.author.id)) {
      logger.warn(`User ${message.author.tag} (${message.author.id}) is in the blacklist. Ignoring message.`);
      return;
    }

    // Check if the server is leave blacklisted
    if (blacklist.servers.leave.includes(message.guild.id)) {
      logger.warn(`Server ${message.guild.name} (${message.guild.id}) is in the "leave" blacklist. Leaving server.`);
      await message.guild.leave();
      return;
    }

    // Check if the server is ignored
    if (blacklist.servers.ignore.includes(message.guild.id)) {
      logger.warn(`Server ${message.guild.name} (${message.guild.id}) is in the "ignore" blacklist. Ignoring message.`);
      return;
    }

    if (message.author.bot) {
      logger.debug('Ignoring bot message.');
      return;
    }

    // Check if the message mentions the bot
    const mention = new RegExp(`^<@!?${client.user.id}>$`);
    const mentionWithCommand = new RegExp(`^<@!?${client.user.id}> `);

    // Respond to mentions without a command with the bot's prefix
    if (mention.test(message.content)) {
      logger.message(`Bot mentioned by ${message.author.tag} in channel ${message.channel.name}`);
      return message.reply(`My prefix is \`${prefix}\``);
    }

    // Check if the message starts with the prefix or mentions the bot
    const isMention = mentionWithCommand.test(message.content);
    if (!message.content.startsWith(prefix) && !isMention) {
      logger.debug(`Message does not start with prefix or mention: ${message.content}`);
      return;
    }

    // Extract the command and arguments from the message
    const content = isMention ?
      message.content.replace(mentionWithCommand, '') :
      message.content.slice(prefix.length);
    const args = content.trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Check if the command name is an alias
    const command = client.prefixCommands.get(commandName) || client.commandAliases.get(commandName);

    // Ignore unknown commands
    if (!command) {
      logger.debug(`Command not found: ${commandName}`);
      return;
    }

    // Restrict owner-only commands
    const { ownerId } = require('../config/config.json');
    if (command.category.toLowerCase() === 'owner' && !ownerId.includes(message.author.id)) {
      logger.debug(`Unauthorized attempt to use owner command: ${commandName} by ${message.author.tag}`);
      return;
    }


    // Check if the command is NSFW and the channel is not NSFW
    if (command.nsfw && !message.channel.nsfw) {
      logger.debug(`NSFW command used in non-NSFW channel: ${commandName}`);
      return;
    }

    // User Cooldown
    if (cooldown.user.enabled(command)) {
      logger.debug(`User Cooldown activated: ${commandName} by ${message.author.tag}`);
      console.log(cooldown.user.data.get(message.author.id));
      if (!cooldown.user.data.get(message.author.id)) cooldown.user.add(message.author.id, command);
      else if (cooldown.user.data.get(message.author.id) && cooldown.user.data.get(message.author.id).cooldowns.find(x =>
        x.name === command.name) && cooldown.user.data.get(message.author.id).cooldowns.find(x =>
        x.name === command.name).time > Date.now()) return message.reply('You still have a cooldown on this command');
    }

    // Guild Cooldown
    if (cooldown.guild.enabled(command)) {
      logger.debug(`Guild Cooldown activated: ${commandName} in ${message.guild.name} by ${message.author.tag}`);
      if (!cooldown.guild.data.get(message.guild.id)) cooldown.guild.add(message.guild.id, command);
      else if (cooldown.guild.data.get(message.guild.id) && cooldown.guild.data.get(message.guild.id).cooldowns.find(x =>
        x.name === command.name).time > Date.now()) return message.reply('The guild still has a cooldown on this command');
    }

    // Global Cooldown
    if (cooldown.global.enabled(command)) {
      logger.debug(`Global Cooldown activated: ${commandName} by ${message.author.tag}`);
      if (!cooldown.global.get(command)) cooldown.global.add(command);
      else if (cooldown.global.get(command) && cooldown.global.get(command).cooldowns.find(x =>
        x.name === command.name).time > Date.now()) return message.reply('This command is still on cooldown globally');
    }

    try {
      logger.command(`Prefix Command ${command.name} used by ${message.author.tag} in ${message.guild.name}`);
      await command.execute(message, args, client);
    } catch (error) {
      logger.error(`${error.stack}`, client, 'prefix', {
        context: message,
        args: [command.name, ...args],
        command: command.name,
      });

      // Reply to the user with a generic error message
      await message.reply({
        content: 'An error occurred with this command.',
        allowedMentions: { repliedUser: false },
      }).catch(err => logger.error(`Reply error: ${err.message}`, client));
    }
  },
};

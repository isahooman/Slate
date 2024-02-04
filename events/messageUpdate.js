const blacklist = require('../config/blacklist.json');
const { prefix } = require('../config/config.json');
const logger = require('../components/logger.js');

module.exports = {
  name: 'messageUpdate',
  execute: async(oldMessage, newMessage, client) => {
    logger.message('Processing edited message..');

    // Check if the user is blacklisted
    if (blacklist.users.includes(newMessage.author.id)) {
      logger.warn(`User ${newMessage.author.tag} (${newMessage.author.id}) is in the blacklist. Ignoring message.`);
      return;
    }

    // Check if the server is leave blacklisted
    if (blacklist.servers.leave.includes(newMessage.guild.id)) {
      logger.warn(`Server ${newMessage.guild.name} (${newMessage.guild.id}) is in the "leave" blacklist. Leaving server.`);
      await newMessage.guild.leave();
      return;
    }

    // Check if the server is ignored
    if (blacklist.servers.ignore.includes(newMessage.guild.id)) {
      logger.warn(`Server ${newMessage.guild.name} (${newMessage.guild.id}) is in the "ignore" blacklist. Ignoring message.`);
      return;
    }

    if (newMessage.author.bot || !newMessage.guild) {
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
      logger.debug(`Message does not start with prefix or mention: ${newMessage.content}`);
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
    const { ownerId } = require('../config/config.json');
    if (command.category === 'owner' && !ownerId.includes(newMessage.author.id)) {
      logger.debug(`Unauthorized attempt to use owner command: ${commandName} by ${newMessage.author.tag}`);
      return;
    }

    // Check if the command is NSFW and the channel is not NSFW
    if (command.nsfw && !newMessage.channel.nsfw) {
      logger.debug(`NSFW command used in non-NSFW channel: ${commandName}`);
      return;
    }

    try {
      logger.command(`Prefix Command ${command.name} used by ${newMessage.author.tag} in ${newMessage.guild.name}`);
      await command.execute(newMessage, args, client);
    } catch (error) {
      logger.error(`${error.stack}`, client, 'prefix', {
        context: newMessage,
        args: [command.name, ...args],
        command: command.name,
      });

      // Reply to the user with generic error message
      await newMessage.reply({
        content: 'An error occurred with this command.',
        allowedMentions: { repliedUser: false },
      }).catch(err => logger.error(`Reply error: ${err.message}`, client));
    }
  },
};

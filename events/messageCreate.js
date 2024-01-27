const logger = require('../components/logger.js');
const { prefix } = require('../config.json');

module.exports = {
  name: 'messageCreate',
  execute: async(message, client) => {
    logger.debug('Processing new message..');
    if (message.author.bot) {
      logger.debug('Ignoring bot message.');
      return;
    }

    // Check if the message mentions the bot
    const mention = new RegExp(`^<@!?${client.user.id}>$`);
    const mentionWithCommand = new RegExp(`^<@!?${client.user.id}> `);

    // Respond to mentions without a command with the bot's prefix
    if (mention.test(message.content)) {
      logger.debug(`Bot mentioned by ${message.author.tag} in channel ${message.channel.name}`);
      return message.reply(`My prefix is \`${prefix}\``);
    }

    // Check if the message starts with the prefix or mentions the bot
    const isMention = mentionWithCommand.test(message.content);
    if (!message.content.startsWith(prefix) && !isMention) {
      logger.debug(`Message does not start with prefix or mention: ${message.content}`);
      return;
    }

    // Extract the command and arguments from the message
    const content = isMention ? message.content.replace(mentionWithCommand, '') : message.content.slice(prefix.length);
    const args = content.trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.prefixCommands.get(commandName);

    // Ignore unknown commands
    if (!command) {
      logger.debug(`Command not found: ${commandName}`);
      return;
    }

    // Restrict owner-only commands
    const { ownerId } = require('../config.json');
    if (command.category === 'owner' && !ownerId.includes(message.author.id)) {
      logger.debug(`Unauthorized attempt to use owner command: ${commandName} by ${message.author.tag}`);
      return;
    }

    try {
      logger.command(`Prefix Command ${commandName} used by ${message.author.tag} in ${message.guild.name}`);
      await command.execute(message, args, client);
    } catch (error) {
      logger.error(`${error.stack}`, client, 'prefix', {
        context: message,
        args: [commandName, ...args],
        command: commandName,
      });

      // Reply to the user with generic error message
      await message.reply({
        content: 'An error occurred with this command.',
        allowedMentions: { repliedUser: false },
      }).catch(err => logger.error(`Reply error: ${err.message}`, client));
    }
  },
};

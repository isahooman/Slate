const logger = require('../components/logger.js');
const { prefix } = require('../config.json');

module.exports = {
  name: 'messageUpdate',
  execute: async(oldMessage, newMessage, client) => {
    logger.debug('Processing edited message..');
    if (newMessage.author.bot || !newMessage.guild) {
      logger.debug('Ignoring bot message.');
      return;
    }

    // Check if the updated message mentions the bot
    const mention = new RegExp(`^<@!?${client.user.id}>$`);
    const mentionWithCommand = new RegExp(`^<@!?${client.user.id}> `);

    // Respond to mentions without a command with the bot's prefix
    if (mention.test(newMessage.content)) {
      logger.info(`Bot mentioned by ${newMessage.author.tag} in channel ${newMessage.channel.id}`);
      return newMessage.reply(`My prefix is \`${prefix}\``);
    }

    // Check if the message starts with the prefix or mentions the bot
    const isMention = mentionWithCommand.test(newMessage.content);
    if (!newMessage.content.startsWith(prefix) && !isMention) {
      logger.debug(`Message does not start with prefix or mention: ${newMessage.content}`);
      return;
    }

    // Extract the command and arguments from the updated message
    const content = isMention ? newMessage.content.replace(mentionWithCommand, '') : newMessage.content.slice(prefix.length);
    const args = content.trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.prefixCommands.get(commandName);

    // Ignore unknown commands
    if (!command) {
      logger.debug(`No command found for: ${commandName}`);
      return;
    }

    // Restrict owner-only commands
    const { ownerId } = require('../config.json');
    if (command.category === 'owner' && !ownerId.includes(newMessage.author.id)) {
      logger.debug(`Unauthorized attempt to use owner command: ${commandName} by ${newMessage.author.tag}`);
      return;
    }

    try {
      logger.command(`Prefix Command ${commandName} used by ${newMessage.author.tag} in ${newMessage.guild.name}`);
      await command.execute(newMessage, args, client);
    } catch (error) {
      // Log the entire error object for more details
      logger.error(`${error.stack}`, client, 'prefix', {
        context: newMessage,
        args: [commandName, ...args],
        command: commandName,
      });

      // Reply to the user about the error
      await newMessage.reply({
        content: 'An error occurred with this command.',
        allowedMentions: { repliedUser: false },
      }).catch(err => logger.error(`Reply error: ${err.message}`, client));
    }
  },
};

const { Collection, Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const { clientId, token, guildId, prefix, ownerId } = require('./util/config.json');
const logger = require('./util/logger.js');
const path = require('path');
const fs = require('fs');

const client = new Client({
  intents:
    [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  partials:
    [
      Partials.Channel,
    ],
});

logger.debug('Bot starting..');

// Read commands
function readCommands(directory) {
  logger.debug(`Reading command files from: ${path.relative(process.cwd(), directory)}`);
  const files = fs.readdirSync(directory);
  let commandFiles = [];

  for (const file of files) {
    const filepath = path.join(directory, file);
    if (fs.statSync(filepath).isDirectory()) commandFiles = commandFiles.concat(readCommands(filepath));
    else if (file.endsWith('.js')) commandFiles.push({ path: filepath, directory });
  }
  return commandFiles;
}
client.readCommands = readCommands;

// Load Slash Commands
client.slashCommands = new Collection();
const slashCommandFiles = readCommands(path.join(__dirname, 'commands/slash'));

for (const fileData of slashCommandFiles) try {
  const command = require(fileData.path);
  client.slashCommands.set(command.data.name, {
    ...command,
    directory: fileData.directory,
  });
  logger.info(`Slash command loaded: ${command.data.name}`);
} catch (error) {
  logger.error(`Error loading slash command at ${fileData.path}: ${error.message}`);
}

// Load Prefix Commands
client.prefixCommands = new Collection();
const prefixCommandFiles = readCommands(path.join(__dirname, 'commands/prefix'));

for (const fileData of prefixCommandFiles) try {
  const command = require(fileData.path);
  client.prefixCommands.set(command.name.toLowerCase(), {
    ...command,
    directory: fileData.directory,
  });
  logger.info(`Prefix command loaded: ${command.name}`);
} catch (error) {
  logger.error(`Error loading prefix command at ${fileData.path}: ${error.message}`);
}

logger.debug('Commands loaded.');

// Separate global and dev slash commands
const globalCommands = [];
const devCommands = [];
const globalDir = path.join(__dirname, 'commands/slash/global');
const devDir = path.join(__dirname, 'commands/slash/dev');

for (const [_, commandData] of client.slashCommands.entries()) if (commandData.directory.startsWith(globalDir)) globalCommands.push(commandData.data.toJSON());
else if (commandData.directory.startsWith(devDir)) devCommands.push(commandData.data.toJSON());

// redeploy slash commands on startup
const rest = new REST({ version: '10' }).setToken(token);
(async() => {
  try {
    logger.info('Deploying slash commands...');
    // Register global commands
    if (globalCommands.length) {
      await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
      logger.info(`Successfully reloaded ${globalCommands.length} global commands.`);
    }

    // Register dev commands
    if (devCommands.length) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: devCommands });
      logger.info(`Successfully reloaded ${devCommands.length} dev commands.`);
    }
  } catch (error) {
    logger.error(`Error deploying commands: ${error}`);
  }
})();

client.once('ready', () => {
  logger.info(`Logged in as ${client.user.tag}!`);
  logger.debug('Bot is ready and online.');
});

// Slash command handler
client.on('interactionCreate', async interaction => {
  logger.info(`Received interaction: ${interaction.id}`);
  logger.command(`Slash Command ${interaction.commandName} used by ${interaction.user.username} | ${interaction.user}`);
  logger.debug(`Processing slash command: ${interaction.commandName}`);
  const command = client.slashCommands.get(interaction.commandName);

  try {
    await command.execute(interaction, client);
  } catch (error) {
    logger.error(`Error executing slash command: ${error.message}`, client, 'slash', { interaction });
    if (interaction.replied || interaction.deferred) await interaction.editReply({ content: 'An error occurred with this command.' }).catch(logger.error);
    else await interaction.reply({ content: 'An error occurred with this command.', ephemeral: false }).catch(logger.error);
  }
});

// Prefix command handler
client.on('messageCreate', async message => {
  logger.debug('Processing new message..');
  if (message.author.bot) return;

  const mention = new RegExp(`^<@!?${client.user.id}>$`);
  const mentionWithCommand = new RegExp(`^<@!?${client.user.id}> `);
  // Respond to mentions with prefix
  if (mention.test(message.content)) {
    logger.debug(`Bot mentioned by ${message.author.tag} in channel ${message.channel.name}`);
    return message.reply(`My prefix is \`${prefix}\``);
  }
  const isMention = mentionWithCommand.test(message.content);

  if (!message.content.startsWith(prefix) && !isMention) {
    logger.debug(`Message does not start with prefix or mention: ${message.content}`);
    return;
  }

  const content = isMention ? message.content.replace(mentionWithCommand, '') : message.content.slice(prefix.length);
  const args = content.trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.prefixCommands.get(commandName);

  if (!command) {
    logger.debug(`Command not found: ${commandName}`);
    return;
  }

  // Check if the command is an "owner" command and if the user is a bot owner
  if (command.category === 'owner' && !ownerId.includes(message.author.id)) {
    logger.debug(`Unauthorized attempt to use owner command: ${commandName} by ${message.author.tag}`);
    return;
  }

  try {
    logger.command(`Prefix Command ${commandName} used by ${message.author.tag} in ${message.guild.name}`);
    await command.execute(message, args, client);
  } catch (error) {
    logger.error(error.message, client, 'prefix', { context: message, args: [commandName, ...args] });
    await message.reply({
      content: 'An error occurred with this command.',
      allowedMentions: { repliedUser: false },
    }).catch(logger.error);
  }
});

// Edited message handler for prefix
client.on('messageUpdate', async(oldMessage, newMessage) => {
  logger.debug('Processing edited message..');
  if (newMessage.author.bot || !newMessage.guild) return;

  const mention = new RegExp(`^<@!?${client.user.id}>$`);
  const mentionWithCommand = new RegExp(`^<@!?${client.user.id}> `);

  if (mention.test(newMessage.content)) {
    logger.info(`Bot mentioned by ${newMessage.author.tag} in channel ${newMessage.channel.id}`);
    return newMessage.reply(`My prefix is \`${prefix}\``);
  }

  const isMention = mentionWithCommand.test(newMessage.content);

  if (!newMessage.content.startsWith(prefix) && !isMention) {
    logger.debug(`Message does not start with prefix or mention: ${newMessage.content}`);
    return;
  }

  logger.debug(`Message does not start with prefix or mention: ${newMessage.content}`);
  const content = isMention ? newMessage.content.replace(mentionWithCommand, '') : newMessage.content.slice(prefix.length);
  const args = content.trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.prefixCommands.get(commandName);

  if (!command) {
    logger.debug(`No command found for: ${commandName}`);
    return;
  }

  // Check if the command is an "owner" command and if the user is a bot owner
  if (command.category === 'owner' && !ownerId.includes(newMessage.author.id)) {
    logger.debug(`Unauthorized attempt to use owner command: ${commandName} by ${newMessage.author.tag}`);
    return;
  }

  try {
    logger.command(`Prefix Command ${commandName} used by ${newMessage.author.tag} in ${newMessage.guild.name}`);

    await command.execute(newMessage, args, client);
  } catch (error) {
    logger.error(error.message, client, 'prefix', { context: newMessage, args: [commandName, ...args] });
    await newMessage.reply('An error occurred with this command.').catch(logger.error);
  }
});

client.login(token);

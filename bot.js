const { Collection, Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const { clientId, token, guildId, prefix } = require('./config.json');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

// Instances
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel],
});

// Read commands
function readCommands(directory) {
    const files = fs.readdirSync(directory);
    let commandFiles = [];

    for (const file of files) {
        const filepath = path.join(directory, file);
        if (fs.statSync(filepath).isDirectory()) {
            commandFiles = commandFiles.concat(readCommands(filepath));
        } else if (file.endsWith('.js')) {
            commandFiles.push(filepath);
        }
    }
    return commandFiles;
}

// Load Slash Commands
client.slashCommands = new Collection();
const slashCommandFiles = readCommands(path.join(__dirname, 'commands/slash'));

for (const filepath of slashCommandFiles) {
    try {
        const command = require(filepath);
        client.slashCommands.set(command.data.name, command);
        logger.info(`Slash command loaded: ${command.data.name}`);
    } catch (error) {
        logger.error(`Error loading slash command at ${filepath}: ${error.message}`);
    }
}

// Load Prefix Commands
client.prefixCommands = new Collection();
const prefixCommandFiles = readCommands(path.join(__dirname, 'commands/prefix'));

for (const filepath of prefixCommandFiles) {
    try {
        const command = require(filepath);
        client.prefixCommands.set(command.name, command);
        logger.info(`Prefix command loaded: ${command.name}`);
    } catch (error) {
        logger.error(`Error loading prefix command at ${filepath}: ${error.message}`);
    }
}

// Separate global and dev slash commands
const globalCommands = [];
const devCommands = [];

for (const command of client.slashCommands.values()) {
    if (command.global) {
        globalCommands.push(command.data.toJSON());
    } else {
        devCommands.push(command.data.toJSON());
    }
}

// Deploy slash commands on startup
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        // Register global commands
        await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
        logger.info(`Successfully reloaded ${globalCommands.length} global commands.`);

        // Register dev commands
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: devCommands });
        logger.info(`Successfully reloaded ${devCommands.length} dev commands.`);
    } catch (error) {
        logger.error(error);
    }
})();

client.once('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

/*
Slash command handler
handles slash command execution
logs using './logger.js'
reports errors to owner using logger.js 
*/
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        // Log command execution
        logger.info(`Executing slash command: ${interaction.commandName}`);

        await command.execute(interaction, client);
    } catch (error) {
        logger.error(error, client, interaction, 'slash');
        await interaction.reply({
            content: 'An error occurred with this command.',
            ephemeral: true,
        }).catch(console.error);
    }
});

// Prefix command handler
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>$`);
    const mentionWithCommandRegex = new RegExp(`^<@!?${client.user.id}> `);

    if (mentionRegex.test(message.content)) {
        return message.reply(`My prefix is \`${prefix}\``);
    }

    const isMention = mentionWithCommandRegex.test(message.content);

    if (!message.content.startsWith(prefix) && !isMention) return;

    const content = isMention ? message.content.replace(mentionWithCommandRegex, '') : message.content.slice(prefix.length);
    const args = content.trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
        logger.info(`Executing prefix command: ${commandName}`);

        await command.execute(message, args, client);
    } catch (error) {
        logger.error(error, client, message, 'prefix', [commandName, ...args]);
        await message.reply({
            content: 'An error occurred with this command.',
            allowedMentions: { repliedUser: false }
        }).catch(console.error);
    }
});

// Edited message handler
client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (newMessage.author.bot || !newMessage.guild) return;

    const mentionRegex = new RegExp(`^<@!?${client.user.id}>$`);
    const mentionWithCommandRegex = new RegExp(`^<@!?${client.user.id}> `);

    if (mentionRegex.test(newMessage.content)) {
        return newMessage.reply(`My prefix is \`${prefix}\``);
    }

    const isMention = mentionWithCommandRegex.test(newMessage.content);

    if (!newMessage.content.startsWith(prefix) && !isMention) return;

    const content = isMention ? newMessage.content.replace(mentionWithCommandRegex, '') : newMessage.content.slice(prefix.length);
    const args = content.trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
        logger.info(`Executing edited prefix command: ${commandName}`);
        await command.execute(newMessage, args, client);
    } catch (error) {
        logger.error(error, client, newMessage, 'prefix', [commandName, ...args]);
        await newMessage.reply({
            content: 'An error occurred with this command.',
            allowedMentions: { repliedUser: false }
        }).catch(console.error);
    }
});

client.login(token);
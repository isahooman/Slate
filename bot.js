const { Collection, Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const { clientId, token, guildId } = require('./config.json');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

// Instances
const client = new Client({
    intents: 
    [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.MessageContent
    ],
    partials: 
    [
        Partials.Channel
    ],
});

// read comands
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

// Set up commands Collection
client.commands = new Collection();
const commandFiles = readCommands(path.join(__dirname, 'commands'));

// Load commands and separate Global/Dev
const globalCommands = [];
const guildCommands = [];

for (const filepath of commandFiles) {
    const command = require(filepath);
    client.commands.set(command.data.name, command);

    if (filepath.includes('/global/')) {
        globalCommands.push(command.data.toJSON());
    } else if (filepath.includes('/dev/')) {
        guildCommands.push(command.data.toJSON());
    }
}

// Deploy slash commands on startup
const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        // Reading global command files
        const globalCommandFiles = fs.readdirSync('./commands/global').filter(file => file.endsWith('.js'));
        const globalCommands = globalCommandFiles.map(file => {
            const command = require(`./commands/global/${file}`);
            return command.data.toJSON();
        });

        // Reading guild-specific command files
        const guildCommandFiles = fs.readdirSync('./commands/dev').filter(file => file.endsWith('.js'));
        const guildCommands = guildCommandFiles.map(file => {
            const command = require(`./commands/dev/${file}`);
            return command.data.toJSON();
        });

        // Register global commands
        await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
        logger.info('Successfully reloaded global application (/) commands.');

        // Register guild-specific commands
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: guildCommands });
        logger.info('Successfully reloaded guild-specific application (/) commands.');
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

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        // Log the error for the owner's review
        logger.error(error, client, interaction);

        // Respond to the user with a simplified error message
        await interaction.reply({
            content: 'An error occurred while executing this command.\nIf the error continues please wait a short while, the error has been reported to the owner to implement a fix if needed!',
            ephemeral: true,
        }).catch(console.error);
    }
});

client.on('error', error => {
    logger.error(`Encountered an error: ${error}`, client);
    logger.error(error.stack, client);
});

client.login(token);
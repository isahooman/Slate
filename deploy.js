// Importing required modules and configurations
const { clientId, guildId, token } = require('./config.json');
const { REST, Routes } = require('discord.js');
const logger = require('./logger');
const fs = require('fs');

function loadCommandFiles(directory) {
// Read files from command directories
return fs.readdirSync(directory)
  .filter(file => file.endsWith('.js'))
  .map(file => require(`${directory}/${file}`).data.toJSON());
}

// Load global and dev commands
const globalCommands = loadCommandFiles('./commands/slash/global');
const Devcommands = loadCommandFiles('./commands/slash/dev');

// Create a new client
const rest = new REST({ version: '10' }).setToken(token);

(async() => {
  try {
    // Deploy global commands to all guilds
    await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
    logger.info('Registered global slash commands!');

    // Deploy guild-specific commands to a specific guild
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: Devcommands });
    logger.info(`Registered dev slash commands for: ${guildId}`);
  } catch (error) {
    logger.error(error);
  }
})();

const { clientId, guildId, token } = require('./config.json');
const { REST, Routes } = require('discord.js');
const logger = require('./logger');
const fs = require('fs');

const globalCommands = [];
const guildCommands = [];
const globalCommandFiles = fs.readdirSync('./commands/slash/global').filter(file => file.endsWith('.js'));
const guildCommandFiles = fs.readdirSync('./commands/slash/dev').filter(file => file.endsWith('.js'));

for (const file of globalCommandFiles) {
  const command = require(`./commands/slash/global/${file}`);
  globalCommands.push(command.data.toJSON());
}

for (const file of guildCommandFiles) {
  const command = require(`./commands/slash/dev/${file}`);
  guildCommands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    // Deploy global commands
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: globalCommands },
    );
    logger.info('Registered global slash commands!');

    // Deploy dev commands
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: guildCommands },
    );
    logger.info(`Registered dev slash commands for guildId: ${guildId}`);
  } catch (error) {
    logger.error(error);
  }
})();
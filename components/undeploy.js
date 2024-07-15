const path = require('path');
const { readJSON5 } = require('./json5Parser.js');
const { clientId, token, guildId } = readJSON5(path.join(__dirname, '../config/config.json5'));
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(token);

/**
 * Unregisters all slash commands
 * @author isahooman
 */
async function undeploy() {
  try {
    process.stdout.write('Started removing registered commands.\n');

    // Register an empty array for Global Commands effectively deleting all registered slash commands
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: [] },
    );

    process.stdout.write('Successfully unregistered global application commands.\n');

    process.stdout.write('Started unregistering guild application commands.\n');

    // Register an empty array for Guild Commands effectively deleting all registered slash commands
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: [] },
    );

    process.stdout.write('Successfully deleted all guild application commands.\n');
  } catch (error) {
    process.stderr.write('Error deleting commands:', error);
  }
}

module.exports =
{
  undeploy,
};

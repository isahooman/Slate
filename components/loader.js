const { loadEvents, reloadEvents, setEventEnabled, isEventEnabled } = require('./events.js');
const { loadCommands, togglePrefixCommand, toggleSlashCommand } = require('./commands.js');

/**
 * Load all events and commands
 * @param {import("discord.js").Client} client Discord Client
 */
async function loadAll(client) {
  await loadCommands(client);
  await loadEvents(client);
}

module.exports =
{
  loadAll,
  reloadEvents,
  togglePrefixCommand,
  toggleSlashCommand,
  setEventEnabled,
  isEventEnabled,
};

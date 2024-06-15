const { loadEvents, reloadAllEvents, setEventEnabled, isEventEnabled, reloadEvent } = require('./events.js');
const { loadCommands, togglePrefixCommand, toggleSlashCommand, reloadAllCommands, isPrefixCommandEnabled, isSlashCommandEnabled, findNearestCommand } = require('./commands.js');

/**
 * Load all events and commands
 * @param {client} client Discord Client
 */
async function loadAll(client) {
  await loadCommands(client);
  await loadEvents(client);
}

module.exports =
{
  loadAll,
  reloadAllEvents,
  togglePrefixCommand,
  toggleSlashCommand,
  setEventEnabled,
  isEventEnabled,
  reloadAllCommands,
  isPrefixCommandEnabled,
  isSlashCommandEnabled,
  reloadEvent,
  findNearestCommand,
};

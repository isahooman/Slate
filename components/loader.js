const { loadCommands, isPrefixCommandEnabled, isSlashCommandEnabled, reloadAllCommands, reloadCommand, findNearestCommand, togglePrefixCommand, toggleSlashCommand } = require('./commands.js');
const { loadEvents, reloadAllEvents, reloadEvent, setEventEnabled, isEventEnabled } = require('./events.js');

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
  reloadCommand,
};

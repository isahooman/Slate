const { loadCommands, togglePrefixCommand, toggleSlashCommand, reloadAllCommands, isPrefixCommandEnabled, isSlashCommandEnabled, findNearestCommand, reloadCommand } = require('./commands.js');
const { loadEvents, reloadAllEvents, setEventEnabled, isEventEnabled, reloadEvent } = require('./events.js');
const { deployCommands, undeploy } = require('./deploy.js');

/**
 * Load all events and commands
 * @param {client} client - Discord Client
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
  deployCommands,
  undeploy,
};

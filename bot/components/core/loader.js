const { loadCommands, togglePrefixCommand, toggleSlashCommand, reloadAllCommands, isPrefixCommandEnabled, isSlashCommandEnabled, findNearestCommand, reloadCommand } = require('../commands/commands.js');
const { loadEvents, reloadAllEvents, setEventEnabled, isEventEnabled, reloadEvent } = require('../util/events.js');
const { deployCommands, undeploy } = require('../util/deploy.js');

/**
 * Load all events and commands
 * @param {client} client - Discord Client
 */
async function loadAll(client) {
  await loadCommands(client);
  await loadEvents(client);
}

module.exports = {
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

const { loadCommands, togglePrefixCommand, toggleSlashCommand, reloadAllCommands, isPrefixCommandEnabled, isSlashCommandEnabled, findNearestCommand, reloadCommand } = require('./commands.js');
const { loadEvents, reloadAllEvents, setEventEnabled, isEventEnabled, reloadEvent } = require('./events.js');
let logger = require('./logger.js');

/**
 * Reloads the logger by clearing its cache
 */
function reloadLogger() {
  delete require.cache[require.resolve('./loader.js')]; // Clear the cache for logger.js
  logger = require('./loader.js'); // Re-import the logger
}

/**
 * Load all events and commands
 * @param {client} client Discord Client
 */
async function loadAll(client) {
  await loadCommands(client, logger);
  await loadEvents(client, logger);
}

module.exports =
{
  loadAll,
  reloadAllEvents: () => reloadAllEvents(logger),
  togglePrefixCommand: (input, client) => togglePrefixCommand(input, client, logger),
  toggleSlashCommand: (input, client) => toggleSlashCommand(input, client, logger),
  setEventEnabled: (eventName, enabled) => setEventEnabled(eventName, enabled, logger),
  isEventEnabled: eventName => isEventEnabled(eventName, logger),
  reloadAllCommands: (client, commandType) => reloadAllCommands(client, commandType, logger),
  isPrefixCommandEnabled: commandName => isPrefixCommandEnabled(commandName, logger),
  isSlashCommandEnabled: commandName => isSlashCommandEnabled(commandName, logger),
  reloadEvent: (event, interaction) => reloadEvent(event, interaction, logger),
  findNearestCommand: (input, commands, type) => findNearestCommand(input, commands, type, logger),
  reloadCommand: (command, interaction) => reloadCommand(command, interaction, logger),
  reloadLogger,
  logger,
};


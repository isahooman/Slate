const { loadEvents, reloadEvents } = require('./events.js');
const { loadCommands } = require('./commands.js');

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
  };

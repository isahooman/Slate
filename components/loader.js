const loadCommands = require('./commands.js');
const logger = require('./logger.js');
const path = require('path');
const fs = require('fs');

// Load all events and commands for the client
function loadAll(client) {
  loadEvents(client);
  loadCommands(client);
}

// Load event handlers from '../events/'
function loadEvents(client) {
  const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(__dirname, '../events', file);
    const event = require(filePath);

    // Register the events
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
  }

  logger.debug('Events loaded.');
}

module.exports = loadAll;

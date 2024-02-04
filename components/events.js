const logger = require('./logger.js');
const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, '../config/events.json');

// load events
function loadEvents(client) {
  // Read all files in the events directory
  const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
  // Load event config
  const eventConfig = loadEventConfig();

  // Loop through each event file
  for (const file of eventFiles) {
    const eventName = file.slice(0, -3);

    // Check if the event is enabled in the config
    if (eventConfig[eventName] === true) {
      logger.loading(`Client Event Loaded: ${eventName}`);
      const filePath = path.join(__dirname, '../events', file);
      const event = require(filePath);

      // Attach the event listener to the client
      if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
      else client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
  logger.debug('Events loaded.');
}

// Reload events
function reloadEvents(client) {
  const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

  // Loop through each event file
  for (const file of eventFiles) {
    const filePath = path.join(__dirname, '../events', file);

    try {
      // Delete the cached module to allow for re-requiring
      delete require.cache[require.resolve(filePath)];
      const event = require(filePath);

      // Remove all listeners for the event and reattach them
      client.removeAllListeners(event.name);

      if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
      else client.on(event.name, (...args) => event.execute(...args, client));

      logger.debug(`Reloaded event: ${event.name}`);
    } catch (error) {
      logger.error(`Error reloading event ${file}: ${error.message}`);
    }
  }
  logger.debug('Events reloaded.');
}

// load config data
function loadEventConfig() {
  try {
    const eventConfigData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(eventConfigData);
  } catch (error) {
    logger.error(`Error loading event config: ${error.message}`);
    return {};
  }
}

// toggle an event's status in the config file (not yet in use)
function toggleEvent(eventName, isEnabled) {
  const eventConfig = loadEventConfig();
  if (eventConfig[eventName] !== undefined) {
    eventConfig[eventName] = isEnabled;
    saveEventConfig(eventConfig);
    logger.debug(`Event '${eventName}' toggled ${isEnabled ? 'on' : 'off'}.`);
  } else {
    logger.error(`Event '${eventName}' not found in event config.`);
  }
}

// save changes done to the config file
function saveEventConfig(eventConfig) {
  try {
    const eventConfigData = JSON.stringify(eventConfig, null, 2);
    fs.writeFileSync(configPath, eventConfigData);
  } catch (error) {
    logger.error(`Error saving event config: ${error.message}`);
  }
}

module.exports =
  {
    loadEvents,
    reloadEvents,
    toggleEvent,
  };

const path = require('path');
const fs = require('fs');
const { readJSON5, writeJSON5 } = require('./json5Parser.js');

const configPath = path.join(__dirname, '../config/events.json5');

/**
 * Load Events
 * @param {client} client Discord Client
 * @param {logger} logger - Logger
 */
function loadEvents(client, logger) {
  // Read all files in the events directory
  const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

  // Load event config
  const eventConfig = loadEventConfig(logger);

  // Loop through each event file
  for (const file of eventFiles) {
    const eventName = file.slice(0, -3);

    // Check if the event exist in the config file
    if (eventConfig[eventName] === undefined) {
      eventConfig[eventName] = true;
      saveEventConfig(eventConfig, logger);
    }

    // Check if the event is enabled and load it
    if (eventConfig[eventName] === true) {
      logger.loading(`Client Event Loaded: ${eventName}`);
      const filePath = path.join(__dirname, '../events', file);
      const event = require(filePath);

      // Attach the event listener to the client
      if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
      else client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
  logger.info('Events loaded.');
}

/**
 * Reload Events
 * @param {client} client - Discord Client
 * @param {logger} logger - Logger
 */
function reloadAllEvents(client, logger) {
  // Retrieve all events from the events directory
  const eventFiles = fs.readdirSync(path.join(__dirname, '../events')).filter(file => file.endsWith('.js'));

  // Load event configuration data
  const eventConfig = loadEventConfig(logger);

  // Loop through each file
  for (const file of eventFiles) {
  // Extract the event name from the event file
    const eventName = file.slice(0, -3);

    // Check if the event exist in the event config
    if (eventConfig[eventName]) {
      const filePath = path.join(__dirname, '../events', file);

      try {
        // Clear event cache
        delete require.cache[require.resolve(filePath)];

        // reload event data
        const event = require(filePath);

        // Remove all listeners for the event
        client.removeAllListeners(event.name);

        // Register the new event listener
        if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
        else client.on(event.name, (...args) => event.execute(...args, client));

        logger.loading(`Reloaded event: ${event.name}`);
      } catch (error) {
        logger.error(`Error reloading event ${file}: ${error.message}`);
      }
    }
  }
  logger.debug('All events reloaded successfully.');
}

/**
 * Reload a specific event
 * @param {client} client - Discord Client
 * @param {string} eventName - The name of the event to reload
 * @param {logger} logger - Logger
 */
function reloadEvent(client, eventName, logger) {
  const eventFile = `../events/${eventName}.js`;
  const filePath = path.join(__dirname, '../events', eventFile);

  try {
    // Clear event cache
    delete require.cache[require.resolve(filePath)];

    // Reload event data
    const event = require(filePath);

    // Remove all listeners for the event
    client.removeAllListeners(event.name);

    // Register the new event listener
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));

    logger.loading(`Reloaded event: ${event.name}`);
  } catch (error) {
    logger.error(`Error reloading event ${eventFile}: ${error.message}`);
  }
}

/**
 * Load Config Data
 * @param {logger} logger - Logger
 * @returns {object|void} Event Config Data
 */
function loadEventConfig(logger) {
  try {
    return readJSON5(configPath);
  } catch (error) {
    logger.error(`Error loading event config: ${error.message}`);
    return {};
  }
}

/**
 * Sets the enabled status of a specific event in the event configuration.
 * If 'enabled' is not provided, it toggles the current state.
 * @param {string} eventName - The name of the event.
 * @param {boolean} [enabled] - (Optional) The new enabled status of the event.
 * @param {logger} logger - Logger
 */
function setEventEnabled(eventName, enabled, logger) {
  // Load the current event config
  const eventConfig = loadEventConfig(logger);

  // If enabled is provided, set the enabled status of the event
  if (enabled !== undefined) {
    eventConfig[eventName] = enabled;
    logger.info(`Event '${eventName}' set to ${enabled ? 'enabled' : 'disabled'}.`);
  } else {
    // If 'enabled' is not provided, toggle the current state
    eventConfig[eventName] = !eventConfig[eventName];
    logger.log(`Event '${eventName}' toggled ${eventConfig[eventName] ? 'on' : 'off'}.`);
  }
  saveEventConfig(eventConfig, logger);
}

/**
 * Saves the event configuration data.
 * @param {object} eventConfig - The config data to be saved.
 * @param {logger} logger - Logger
 */
function saveEventConfig(eventConfig, logger) {
  try {
    writeJSON5(configPath, eventConfig);
  } catch (error) {
    logger.error(`Error saving event config: ${error.message}`);
  }
}

/**
 * Checks if a given event is enabled in event config.
 * @param {string} eventName - The name of the event to check.
 * @param {logger} logger - Logger
 * @returns {boolean} Returns true if the event is enabled, otherwise false.
 */
function isEventEnabled(eventName, logger) {
  // Load config data
  const eventConfig = loadEventConfig(logger);

  // Check if the event is enabled in the configuration
  return eventConfig[eventName] === true;
}

module.exports =
{
  loadEvents,
  reloadAllEvents,
  setEventEnabled,
  isEventEnabled,
  reloadEvent,
};

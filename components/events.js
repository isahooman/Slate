const path = require('path');
const { logger } = require('./loggerUtil.js');
const { readFile, writeFile, readRecursive } = require('./fileHandler.js');

const configPath = path.join(__dirname, '../config/events.json5');

/**
 * Load Events
 * @param {client} client - Discord Client
 * @author isahooman
 */
async function loadEvents(client) {
  const eventsDirectory = path.join(__dirname, '../events');

  try {
    // Read all files in the events directory using readRecursive
    const eventFiles = await readRecursive(eventsDirectory);

    // Load event config
    const eventConfig = await loadEventConfig();

    // Loop through each event file
    for (const file of eventFiles) {
      const eventName = path.basename(file, '.js');

      // Check if the event exist in the config file
      if (eventConfig[eventName] === undefined) {
        eventConfig[eventName] = true;
        await saveEventConfig(eventConfig);
      }

      // Check if the event is enabled and load it
      if (eventConfig[eventName] === true) {
        logger.loading(`Client Event Loaded: ${eventName}`);
        const event = require(file); // Use the file path directly in require

        // Attach the event listener to the client
        if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
        else client.on(event.name, (...args) => event.execute(...args, client));
      }
    }
    logger.info('Events loaded.');
  } catch (error) {
    // If readRecursive throws an error, the directory doesn't exist
    logger.error(`Error reading events directory: ${error.message}\n${error.stack}`);
  }
}

/**
 * Reload Events
 * @param {client} client - Discord Client
 * @author isahoman
 */
async function reloadAllEvents(client) {
  const eventsDirectory = path.join(__dirname, '../events');

  try {
    // Read all files in the events directory using readRecursive
    const eventFiles = await readRecursive(eventsDirectory);

    // Load event config
    const eventConfig = await loadEventConfig();

    // Loop through each event file
    for (const file of eventFiles) {
      // Extract the event name from the file path
      const eventName = path.basename(file, '.js');

      // Check if the event is enabled and reload it
      if (eventConfig[eventName] === true) {
        // Clear event cache
        delete require.cache[require.resolve(file)];

        // Reload event data
        const event = require(file);

        // Remove all listeners for the event
        client.removeAllListeners(event.name);

        // Register the new event listener
        if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
        else client.on(event.name, (...args) => event.execute(...args, client));

        logger.loading(`Reloaded event: ${event.name}`);
      }
    }
    logger.info('All events reloaded successfully.');
  } catch (error) {
    // If readRecursive throws an error, the directory doesn't exist
    logger.error(`Error reading events directory: ${error.message}\n${error.stack}`);
  }
}

/**
 * Reload a specific event
 * @param {client} client - Discord Client
 * @param {string} eventName - The name of the event to reload
 * @author isahooman
 */
async function reloadEvent(client, eventName) {
  const eventsDirectory = path.join(__dirname, '../events');

  try {
    // Read all files in the events directory using readRecursive
    const eventFiles = await readRecursive(eventsDirectory);

    // Find the specific event file
    const eventFile = eventFiles.find(file => path.basename(file, '.js') === eventName);

    if (!eventFile) {
      logger.warn(`[Reload Event] Event file not found for event: ${eventName}.`);
      return;
    }

    // Clear event cache
    delete require.cache[require.resolve(eventFile)];

    // Reload event data
    const event = require(eventFile);

    // Remove all listeners for the event
    client.removeAllListeners(event.name);

    // Register the new event listener
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));

    logger.loading(`Reloaded event: ${event.name}`);
  } catch (error) {
    logger.error(`[Reload Event] Error reloading event ${eventName}: ${error.message}`);
  }
}

/**
 * Load Config Data
 * @returns {Promise<object|void>} - Event Config Data
 * @author isahooman
 */
async function loadEventConfig() {
  try {
    return await readFile(configPath);
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
 * @author isahooman
 */
async function setEventEnabled(eventName, enabled) {
  // Load the current event config
  const eventConfig = await loadEventConfig();

  // If enabled is provided, set the enabled status of the event
  if (enabled !== undefined) {
    eventConfig[eventName] = enabled;
    logger.info(`Event '${eventName}' set to ${enabled ? 'enabled' : 'disabled'}.`);
  } else {
    // If 'enabled' is not provided, toggle the current state
    eventConfig[eventName] = !eventConfig[eventName];
    logger.log(`Event '${eventName}' toggled ${eventConfig[eventName] ? 'on' : 'off'}.`);
  }
  await saveEventConfig(eventConfig);
}

/**
 * Saves the event configuration data.
 * @param {object} eventConfig - The config data to be saved.
 * @author isahooman
 */
async function saveEventConfig(eventConfig) {
  try {
    await writeFile(configPath, eventConfig);
  } catch (error) {
    logger.error(`Error saving event config: ${error.message}`);
  }
}

/**
 * Checks if a given event is enabled in event config.
 * @param {string} eventName - The name of the event to check.
 * @returns {Promise<boolean>} - Returns true if the event is enabled, otherwise false.
 * @author isahooman
 */
async function isEventEnabled(eventName) {
  // Load config data
  const eventConfig = await loadEventConfig();

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

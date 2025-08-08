const path = require('path');
const logger = require('./logger.js');
const { readRecursive } = require('../core/fileHandler.js');
const configManager = require('../../../components/configManager');

/**
 * Load Events
 * @param {client} client - Discord Client
 * @author isahooman
 */
async function loadEvents(client) {
  const eventsDirectory = path.join(__dirname, '../../events');

  try {
    // Read all files in the events directory using readRecursive
    const eventFiles = await readRecursive(eventsDirectory);

    // Load event config
    const eventConfig = configManager.loadConfig('events');
    let configUpdated = false;

    // Keep track of existing events
    const existingEventNames = new Set(eventFiles.map(file => path.basename(file, '.js')));

    // Remove orphaned config entries
    for (const configEventName in eventConfig) if (!existingEventNames.has(configEventName)) {
      delete eventConfig[configEventName];
      configUpdated = true;
      logger.warn(`Event [${configEventName}] found in config but no file exists, removing from config.`);
    }

    // Loop through each event file
    for (const file of eventFiles) {
      const eventName = path.basename(file, '.js');

      // Check if the event exists in the config file, default to true if not
      if (eventConfig[eventName] === undefined) {
        eventConfig[eventName] = true;
        configUpdated = true;
        logger.debug(`Event [${eventName}] missing from events config, defaulting to enabled.`);
      }

      // Check if the event is enabled and load it
      if (eventConfig[eventName] === true) {
        logger.loading(`Client Event Loaded: ${eventName}`);
        const event = require(file); // Use the file path directly in require

        // Attach the event listener to the client
        if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
        else client.on(event.name, (...args) => event.execute(...args, client));
      } else {
        logger.debug(`Event [${eventName}] is disabled in config, skipping load.`);
      }
    }

    // Save config if any changes were made
    if (configUpdated) configManager.saveConfig('events', eventConfig);

    logger.info('Events loaded.');
  } catch (error) {
    // If readRecursive throws an error, the directory doesn't exist
    logger.error(`Error reading events directory: ${error.message}\n${error.stack}`);
  }
}

/**
 * Reload Events
 * @param {client} client - Discord Client
 * @author isahooman
 */
async function reloadAllEvents(client) {
  const eventsDirectory = path.join(__dirname, '../../events');

  try {
    // Read all files in the events directory using readRecursive
    const eventFiles = await readRecursive(eventsDirectory);

    // Load event config
    const eventConfig = configManager.loadConfig('events');
    let configUpdated = false;

    // Keep track of existing event names
    const existingEventNames = new Set(eventFiles.map(file => path.basename(file, '.js')));

    // Remove orphaned config entries
    for (const configEventName in eventConfig) if (!existingEventNames.has(configEventName)) {
      delete eventConfig[configEventName];
      configUpdated = true;
      logger.debug(`Event [${configEventName}] found in config but no file exists, removing from config.`);
    }

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
      } else {
        logger.debug(`Event [${eventName}] is disabled, skipping reload.`);
        // Ensure disabled events have no listeners
        const event = require(file);
        client.removeAllListeners(event.name);
      }
    }

    // Save config if any orphaned entries were removed
    if (configUpdated) configManager.saveConfig('events', eventConfig);

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
 * @returns {boolean} - If reload was successful.
 * @author isahooman
 */
async function reloadEvent(client, eventName) {
  const eventsDirectory = path.join(__dirname, '../../events');

  try {
    // Read all files in the events directory using readRecursive
    const eventFiles = await readRecursive(eventsDirectory);

    // Find the specific event file
    const eventFile = eventFiles.find(file => path.basename(file, '.js') === eventName);

    if (!eventFile) {
      logger.warn(`[Reload Event] Event file not found for event: ${eventName}.`);
      return false;
    }

    // Load event config to check if enabled
    const eventConfig = configManager.loadConfig('events');

    // Clear event cache
    delete require.cache[require.resolve(eventFile)];

    // Reload event data
    const event = require(eventFile);

    // Remove all listeners for the event first
    client.removeAllListeners(event.name);

    // Register the new event listener only if enabled
    if (eventConfig[eventName] === true) {
      if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
      else client.on(event.name, (...args) => event.execute(...args, client));
      logger.loading(`Reloaded event: ${event.name}`);
      return true;
    } else {
      logger.info(`Event [${eventName}] is disabled, listeners removed.`);
      return true; // Still successful in the sense that the state is updated
    }
  } catch (error) {
    logger.error(`[Reload Event] Error reloading event ${eventName}: ${error.message}`);
    return false;
  }
}

/**
 * Sets the enabled status of a specific event in the event configuration.
 * If 'enabled' is not provided, it toggles the current state.
 * @param {string} eventName - The name of the event.
 * @param {boolean} [enabled] - (Optional) The new enabled status of the event.
 * @returns {boolean} The new status of the event.
 * @author isahooman
 */
function setEventEnabled(eventName, enabled) {
  // Load the current event config
  const eventConfig = configManager.loadConfig('events');

  let newStatus;
  // If enabled is provided, set the enabled status of the event
  if (enabled !== undefined) {
    newStatus = !!enabled; // Ensure boolean
    eventConfig[eventName] = newStatus;
    logger.info(`Event '${eventName}' set to ${newStatus ? 'enabled' : 'disabled'}.`);
  } else {
    // If 'enabled' is not provided, toggle the current state (default to true if undefined)
    newStatus = eventConfig[eventName] === undefined ? true : !eventConfig[eventName];
    eventConfig[eventName] = newStatus;
    logger.info(`Event '${eventName}' toggled ${newStatus ? 'on' : 'off'}.`);
  }
  configManager.saveConfig('events', eventConfig);
  return newStatus;
}

/**
 * Checks if a given event is enabled in event config.
 * @param {string} eventName - The name of the event to check.
 * @returns {boolean} - Returns true if the event is enabled, otherwise false.
 * @author isahooman
 */
function isEventEnabled(eventName) {
  // Use getConfigValue with a default of true
  return configManager.getConfigValue('events', eventName, true);
}

module.exports = {
  loadEvents,
  reloadAllEvents,
  setEventEnabled,
  isEventEnabled,
  reloadEvent,
};

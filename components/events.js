const logger = require('./logger.js');
const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, '../config/events.json');

/**
 * Load Events
 * @param {import("discord.js").Client} client Discord Client
 */
function loadEvents(client) {
  // Read all files in the events directory
  const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
  // Load event config
  const eventConfig = loadEventConfig();

  // Loop through each event file
  for (const file of eventFiles) {
    const eventName = file.slice(0, -3);

    // Check if the event exist in the config file
    if (eventConfig[eventName] === undefined) {
      eventConfig[eventName] = true;
      saveEventConfig(eventConfig);
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
  logger.debug('Events loaded.');
}

/**
 * Reload Events
 * @param {import("discord.js").Client} client - Discord Client
 */
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

/**
 * Load Config Data
 * @returns {JSON|void} Event Config Data
 */
function loadEventConfig() {
  try {
    const eventConfigData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(eventConfigData);
  } catch (error) {
    logger.error(`Error loading event config: ${error.message}`);
    return {};
  }
}

/**
 * Toggles an event's status in the config file
 * @param {string} eventName Event Name
 * @param {boolean} isEnabled Enabled or not
 */
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

/**
 * Save changes done to the config file
 * @param {JSON} eventConfig Event config JSON
 */
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

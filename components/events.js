const path = require('path');
const fs = require('fs');
const logger = require('./logger.js');

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
  logger.info('Events loaded.');
}

/**
 * Reload Events
 * @param {import("discord.js").Client} client - Discord Client
 */

// TODO: reload comments
function reloadEvents(client) {
  const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
  const eventConfig = loadEventConfig();

  for (const file of eventFiles) {
    const eventName = file.slice(0, -3);

    if (eventConfig[eventName]) {
      const filePath = path.join(__dirname, '../events', file);

      try {
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);

        client.removeAllListeners(event.name);

        if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
        else client.on(event.name, (...args) => event.execute(...args, client));

        logger.debug(`Reloaded event: ${event.name}`);
      } catch (error) {
        logger.error(`Error reloading event ${file}: ${error.message}`);
      }
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
 *
 * @param eventName
 * @param enabled
 */
function setEventEnabled(eventName, enabled) {
  const eventConfig = loadEventConfig();
  if (enabled !== undefined) {
    eventConfig[eventName] = enabled;
    logger.debug(`Event '${eventName}' set to ${enabled ? 'enabled' : 'disabled'}.`);
  } else {
    eventConfig[eventName] = !eventConfig[eventName];
    logger.debug(`Event '${eventName}' toggled ${eventConfig[eventName] ? 'on' : 'off'}.`);
  }
  saveEventConfig(eventConfig);
}

/**
 *
 * @param eventConfig
 */
function saveEventConfig(eventConfig) {
  try {
    const eventConfigData = JSON.stringify(eventConfig, null, 2);
    fs.writeFileSync(configPath, eventConfigData);
  } catch (error) {
    logger.error(`Error saving event config: ${error.message}`);
  }
}

/**
 *
 * @param eventName
 */
function isEventEnabled(eventName) {
  const eventConfig = loadEventConfig();
  return eventConfig[eventName] === true;
}

module.exports =
{
  loadEvents,
  reloadEvents,
  setEventEnabled,
  isEventEnabled,
};

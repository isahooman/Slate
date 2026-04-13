const { Collection } = require('discord.js');

const slashCheck = object => {
  if (object.data) {
    if (object.cooldowns) object.data.cooldowns = object.cooldowns;
    return object.data;
  } else { return object; }
};

/**
 * Cooldown Handler
 * @author isahooman
 */
class Cooldown {
  constructor(type) {
    this.data = new Collection();
    this.type = type;
  }

  /**
   * Adds a cooldown for a command.
   * @param {string|null} id - User/Guild ID Snowflake, or null for global
   * @param {object} commandData - Command Object Data
   * @returns {boolean} True if successful
   * @author isahooman
   */
  add(id, commandData) {
    commandData = slashCheck(commandData);
    // If no snowflake was passed, use the command name as the key
    if (!id) id = commandData.name;

    // Get cooldown duration from command data
    const duration = commandData.cooldowns[this.type];

    // Store the command name and the time when the cooldown expires
    const entry = { name: commandData.name, time: Date.now() + duration };
    const existing = this.data.get(id);
    if (existing) existing.cooldowns.push(entry);
    else this.data.set(id, { id, cooldowns: [entry] });

    // Schedule cooldown removal
    setTimeout(() => {
      const current = this.data.get(id);
      if (!current) return;
      const filtered = current.cooldowns.filter(x => x.name !== commandData.name);
      if (filtered.length === 0) this.data.delete(id);
      else this.data.set(id, { id, cooldowns: filtered });
    }, duration);

    return true;
  }

  /**
   * Returns cooldown information.
   * @param {string|null} id - User/Guild ID Snowflake, or null for global
   * @param {object} commandData - Command Object Data
   * @returns {{ id: string, cooldowns: object[] }|false} Cooldown data
   * @author isahooman
   */
  get(id, commandData) {
    commandData = slashCheck(commandData);
    const key = id || commandData.name;
    return this.data.get(key) || false;
  }

  /**
   * Finds a cooldown entry for a command.
   * @param {string|null} id - User/Guild ID Snowflake, or null for global
   * @param {object} commandData - Command Object Data
   * @returns {{ name: string, time: number }|false} Cooldown entry
   * @author isahooman
   */
  find(id, commandData) {
    commandData = slashCheck(commandData);
    if (!id) id = commandData.name;

    const entry = this.data.get(id);
    if (entry) return entry.cooldowns.find(d => d.name === commandData.name) || false;
    return false;
  }

  /**
   * Returns remaining cooldown time for a command.
   * @param {string|null} id - User/Guild ID Snowflake, or null for global
   * @param {object} commandData - Command Object Data
   * @returns {number} Remaining time in milliseconds
   */
  remaining(id, commandData) {
    const cooldownData = this.find(id, commandData);
    if (!cooldownData) return 0;
    return Math.max(0, cooldownData.time - Date.now());
  }

  /**
   * Checks if a cooldown is enabled for a command.
   * @param {object} commandData - Command Object Data
   * @returns {boolean} True if enabled
   */
  enabled(commandData) {
    commandData = slashCheck(commandData);
    if (!commandData.cooldowns || !commandData.cooldowns[this.type]) return false;
    return commandData.cooldowns[this.type] > 0;
  }
}

module.exports = {
  user: new Cooldown('user'),
  guild: new Cooldown('guild'),
  global: new Cooldown('global'),
};

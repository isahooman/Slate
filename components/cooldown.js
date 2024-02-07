const { Collection } = require('discord.js');

/**
 * Cooldown Handler
 * @author EthanLawr
 */
class Cooldown {
  constructor() {
    this.userCooldown = new Collection();
    this.guildCooldown = new Collection();
    this.globalCooldown = new Collection();
  }

  /**
   * Adds a cooldown to a user
   * @param {string} userID User ID Snowflake
   * @param {object} commandData Command Object Data
   * @returns {boolean} True is successful
   * @author EthanLawr
   */
  addUserCooldown(userID, commandData) {
    if (this.userCooldown.get(userID)) {
      this.userCooldown.get(userID).cooldowns.push({ name: commandData.name, time: Date.now() + commandData.userCooldown });
      return true;
    }
    this.userCooldown.set(userID, {
      id: userID,
      cooldowns: [
        {
          name: commandData.name,
          time: Date.now() + commandData.userCooldown,
        },
      ],
    });
    return true;
  }

  /**
   * Returns User Cooldown information
   * @param {string} userID User ID Snowflake
   * @returns {boolean} True if data exists
   * @author EthanLawr
   */
  getUserCooldown(userID) {
    if (this.userCooldown.get(userID)) return this.userCooldown.get(userID);
    return false;
  }

  /**
   * Adds a cooldown to a guild
   * @param {string} guildID Guild ID Snowflake
   * @param {object} commandData Command Object Data
   * @returns {boolean} True is successful
   * @author EthanLawr
   */
  addGuildCooldown(guildID, commandData) {
    if (this.guildCooldown.get(guildID)) {
      this.guildCooldown.get(guildID).cooldowns.push({ name: commandData.name, time: Date.now() + commandData.guildCooldown });
      return true;
    }
    this.guildCooldown.set(guildID, {
      id: guildID,
      cooldowns: [
        {
          name: commandData.name,
          time: Date.now() + commandData.guildCooldown,
        },
      ],
    });
    return true;
  }

  /**
   * Returns Guild Cooldown information
   * @param {string} guildID Guild ID Snowflake
   * @returns {boolean} True if data exists
   * @author EthanLawr
   */
  getGuildCooldown(guildID) {
    if (this.guildCooldown.get(guildID)) return this.guildCooldown.get(guildID);
    return false;
  }

  /**
   * Adds a cooldown globally
   * @param {object} commandData Command Object Data
   * @returns {boolean} True if successful
   * @author EthanLawr
   */
  addGlobalCooldown(commandData) {
    if (this.globalCooldown.get(commandData.name)) {
      this.globalCooldown.get(commandData.name).cooldowns.push({ name: commandData.name, time: Date.now() + commandData.globalCooldown });
      return true;
    }
    this.globalCooldown.set(commandData.name, {
      id: commandData.name,
      cooldown: {
        name: commandData.name,
        time: Date.now() + commandData.globalCooldown,
      },
    });
    return true;
  }

  /**
   * Gets a global cooldown
   * @param {object} commandData Command Object Data
   * @returns {boolean} True if exists
   * @author EthanLawr
   */
  getGlobalCooldown(commandData) {
    if (this.globalCooldown.get(commandData.name)) return this.globalCooldown.get(commandData.name);
    return false;
  }
}

module.exports =
  {
    Cooldown,
  };


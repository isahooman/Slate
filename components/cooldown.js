const { Collection } = require('discord.js');

const slashCheck = object => {
  if (object.data) {
    if (object.cooldowns) object.data.cooldowns = object.cooldowns;
    return object.data;
  } else { return object; }
};

/**
 * Cooldown Handler
 * @author EthanLawr
 */
class Cooldown {
  constructor() {
    this.data = new Collection();
  }
}

class User extends Cooldown {
  /**
   * Adds a cooldown to a user
   * @param {string} userID User ID Snowflake
   * @param {object} commandData Command Object Data
   * @returns {boolean} True is successful
   * @author EthanLawr
   */
  add(userID, commandData) {
    commandData = slashCheck(commandData);
    if (this.data.get(userID)) {
      this.data.get(userID).cooldowns.push({ name: commandData.name, time: Date.now() + commandData.cooldowns.user });
      setTimeout(() => {
        this.data.set(userID, {
          id: userID,
          cooldowns: this.data.get(userID).cooldowns.filter(x => x.name !== commandData.name),
        });
      }, commandData.cooldowns.user);
      return true;
    }
    this.data.set(userID, {
      id: userID,
      cooldowns: [
        {
          name: commandData.name,
          time: Date.now() + commandData.cooldowns.user,
        },
      ],
    });
    setTimeout(() => {
      if (this.data.get(userID).cooldowns.filter(x => x.name !== commandData.name).length === 0) this.data.delete(userID);
      else this.data.set(userID, {
        id: userID,
        cooldowns: this.data.get(userID).cooldowns.filter(x => x.name !== commandData.name),
      });
    }, commandData.cooldowns.user);
    return true;
  }

  /**
   * Returns User Cooldown information
   * @param {string} userID User ID Snowflake
   * @returns {boolean} True if data exists
   * @author EthanLawr
   */
  get(userID) {
    if (this.data.get(userID)) this.data.get(userID);
    return false;
  }

  /**
   * Adds a cooldown to a user
   * @param {string} userID User ID Snowflake
   * @param {object} commandData Command Object Data
   * @returns {boolean} True is successful
   * @author EthanLawr
   */
  find(userID, commandData) {
    commandData = slashCheck(commandData);
    if (this.data.get(userID)) if (this.data.get(userID).cooldowns.find(data => data.name === commandData.name)) return this.data.get(userID).cooldowns.find(data => data.name === commandData.name);
    return false;
  }
  /**
   * Checks to see if there is a user cooldown for a command
   * @param {object} commandData Command Object Data
   * @returns {boolean} True if exists
   */
  enabled(commandData) {
    if (!commandData.cooldowns || !commandData.cooldowns.user) return false;
    return commandData.cooldowns.user > 0;
  }
}

class Guild extends Cooldown {
  /**
   * Adds a cooldown to a guild
   * @param {string} guildID Guild ID Snowflake
   * @param {object} commandData Command Object Data
   * @returns {boolean} True is successful
   * @author EthanLawr
   */
  add(guildID, commandData) {
    commandData = slashCheck(commandData);
    if (this.data.get(guildID)) {
      this.data.get(guildID).cooldowns.push({ name: commandData.name, time: Date.now() + commandData.cooldowns.guild });
      setTimeout(() => {
        this.data.set(guildID, {
          id: guildID,
          cooldowns: this.data.get(guildID).cooldowns.filter(x => x.name !== commandData.name),
        });
      }, commandData.cooldowns.guild);
      return true;
    }
    this.data.set(guildID, {
      id: guildID,
      cooldowns: [
        {
          name: commandData.name,
          time: Date.now() + commandData.cooldowns.guild,
        },
      ],
    });
    setTimeout(() => {
      if (this.data.get(guildID).cooldowns.filter(x => x.name !== commandData.name).length === 0) this.data.delete(guildID);
      else this.data.set(guildID, {
        id: guildID,
        cooldowns: this.data.get(guildID).cooldowns.filter(x => x.name !== commandData.name),
      });
    }, commandData.cooldowns.guild);
    return true;
  }

  /**
   * Returns Guild Cooldown information
   * @param {string} guildID Guild ID Snowflake
   * @returns {boolean} True if data exists
   * @author EthanLawr
   */
  get(guildID) {
    if (this.data.get(guildID)) return this.data.get(guildID);
    return false;
  }

  /**
   * Checks to see if there is a guild cooldown for a command
   * @param {object} commandData Command Object Data
   * @returns {boolean} True if exists
   */
  enabled(commandData) {
    if (!commandData.cooldowns || !commandData.cooldowns.guild) return false;
    return commandData.cooldowns.guild > 0;
  }
}
class Global extends Cooldown {
  /**
   * Adds a cooldown globally
   * @param {object} commandData Command Object Data
   * @returns {boolean} True if successful
   * @author EthanLawr
   */
  add(commandData) {
    commandData = slashCheck(commandData);
    if (this.data.get(commandData.name)) {
      this.data.get(commandData.name).cooldowns.push({ name: commandData.name, time: Date.now() + commandData.cooldowns.global });
      setTimeout(() => {
        this.data.set(commandData.name, {
          id: commandData.name,
          cooldowns: this.data.get(commandData.name).cooldowns.filter(x => x.name !== commandData.name),
        });
      }, commandData.cooldowns.global);
      return true;
    }
    this.data.set(commandData.name, {
      id: commandData.name,
      cooldowns: [
        {
          name: commandData.name,
          time: Date.now() + commandData.cooldowns.global,
        },
      ],
    });
    setTimeout(() => {
      if (this.data.get(commandData.name).cooldowns.filter(x => x.name !== commandData.name).length === 0) this.data.delete(commandData.name);
      else this.data.set(commandData.name, {
        id: commandData.name,
        cooldowns: this.data.get(commandData.name).cooldowns.filter(x => x.name !== commandData.name),
      });
    }, commandData.cooldowns.global);
    return true;
  }

  /**
   * Gets a global cooldown
   * @param {object} commandData Command Object Data
   * @returns {boolean} True if exists
   * @author EthanLawr
   */
  get(commandData) {
    if (this.data.get(commandData.name)) return this.data.get(commandData.name);
    return false;
  }

  /**
   * Checks to see if there is a global cooldown for a command
   * @param {object} commandData Command Object Data
   * @returns {boolean} True if exists
   */
  enabled(commandData) {
    if (!commandData.cooldowns || !commandData.cooldowns.global) return false;
    return commandData.cooldowns.global > 0;
  }
}

module.exports =
{
  user: new User(),
  guild: new Guild(),
  global: new Global(),
};


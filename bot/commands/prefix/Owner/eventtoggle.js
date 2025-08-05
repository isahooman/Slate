const { setEventEnabled, isEventEnabled, reloadAllEvents } = require('../../../components/core/loader.js');
const logger = require('../../../components/util/logger.js');

module.exports = {
  name: 'eventtoggle',
  usage: 'eventtoggle <event_name>',
  category: 'Owner',
  aliases: ['etoggle', 'toggleevent'],
  allowDM: true,
  description: 'Toggles the specified event',
  execute(message, args) {
    const eventName = args[0];

    // Check if event name is provided
    if (!eventName) {
      logger.debug('[EventToggle Command] Event not provided.');
      message.reply('Please specify an event name to toggle.');
      return;
    }

    // Check if the event exists
    if (!isEventEnabled(eventName)) {
      logger.warn(`[EventToggle Command] Event '${eventName}' does not exist.`);
      message.reply(`Event '${eventName}' does not exist.`);
      return;
    }

    // Toggle the event
    const currentState = isEventEnabled(eventName);
    const newState = !currentState;
    setEventEnabled(eventName, newState);

    // Reload events to toggle listeners
    reloadAllEvents(message.client);

    // Reply with the new state
    message.reply(`Event '${eventName}' is now ${newState ? 'enabled' : 'disabled'}.`);
  },
};

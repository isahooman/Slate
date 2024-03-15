const { setEventEnabled, isEventEnabled, reloadEvents } = require('../../../components/events.js');
const logger = require('../../../components/logger');

module.exports = {
  name: 'eventtoggle',
  usage: 'eventtoggle <event_name>',
  aliases: ['etoggle'],
  category: 'Owner',
  description: 'Toggles the specified event',
  execute(message, args) {
    const eventName = args[0];

    // Check if event name is provided
    if (!eventName) {
      logger.warn('Please provide the name of the event to toggle.');
      message.reply('Please specify an event name to toggle.');
      return;
    }

    // Check if the event exists
    if (!isEventEnabled(eventName)) {
      logger.warn(`Event '${eventName}' does not exist.`);
      message.reply(`Event '${eventName}' does not exist.`);
      return;
    }

    // Toggle the event
    const currentState = isEventEnabled(eventName);
    const newState = !currentState;
    setEventEnabled(eventName, newState);
    reloadEvents(message.client);

    // Reply with the new state
    message.reply(`Event '${eventName}' is now ${newState ? 'enabled' : 'disabled'}.`);
  },
};

const logger = require('../../../components/util/logger.js');
const { sendSuggestion } = require('../../../components/util/report.js');

module.exports = {
  name: 'suggest',
  usage: 'suggest <suggestion>',
  category: 'Utility',
  aliases: ['suggestion'],
  allowDM: true,
  description: 'Make a suggestion',
  async execute(message, args) {
    if (!args.length) {
      logger.warn(`[Suggest Command] No suggestion message provided`);
      return message.channel.send('Please provide a message for your suggestion.');
    }

    // Get the suggestion from the arguments
    const suggestMessage = args.join(' ');

    // Get context for the suggestion
    const context = {
      author: message.author,
      guild: message.guild,
      channel: message.channel,
    };

    // Send the suggestion
    const success = await sendSuggestion(suggestMessage, context);

    if (success) {
      logger.debug(`[Suggest Command] Suggestion submitted successfully`);
      return message.channel.send('Your suggestion has been submitted. Thank you for your feedback!');
    } else {
      logger.warn(`[Suggest Command] Failed to submit suggestion`);
      return message.channel.send('There was an issue submitting your suggestion. Please try again later.');
    }
  },
};

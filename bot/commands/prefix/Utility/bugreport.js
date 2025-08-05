const logger = require('../../../components/util/logger.js');
const { sendBugReport } = require('../../../components/util/report.js');

module.exports = {
  name: 'bugreport',
  usage: 'bugreport <message>',
  category: 'Utility',
  aliases: ['reportbug'],
  allowDM: true,
  description: 'Report a bug',
  async execute(message, args) {
    if (!args.length) {
      logger.warn(`[Bug Report Command] No bug report message provided`);
      return message.channel.send('Please provide a message for your bug report.');
    }

    // Get the bug report from the arguments
    const bugReportMessage = args.join(' ');

    // Get context for the bug report
    const context = {
      author: message.author,
      guild: message.guild,
      channel: message.channel,
    };

    // Send the bug report
    const success = await sendBugReport(bugReportMessage, context);

    if (success) {
      logger.debug(`[Bug Report Command] bug report completed from: ${message.author.tag}`);
      return message.channel.send('Your bug report has been submitted. Thank you for your feedback!');
    } else {
      logger.warn(`[Bug Report Command] Failed to submit bug report`);
      return message.channel.send('There was an issue submitting your bug report. Please try again later.');
    }
  },
};

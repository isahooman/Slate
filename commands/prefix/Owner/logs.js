const logger = require('../../../util/logger.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'logs',
  usage: 'logs <number of lines>',
  category: 'Owner',
  description: 'Retrieve the latest bot logs.',
  execute(message, args) {
    try {
      // Get the number of lines from the command arguments
      const linesToRetrieve = parseInt(args[0]);

      if (isNaN(linesToRetrieve) || linesToRetrieve <= 0) {
        // Log invalid input for linesToRetrieve
        logger.debug('Invalid number of lines requested');
        return message.reply('Please enter a valid number of lines to retrieve.');
      }

      // Read the log file
      const logFilePath = path.join(__dirname, '../../../bot.log');
      let logData = fs.readFileSync(logFilePath, 'utf8').trim();

      const logLines = logData.split('\n').slice(-linesToRetrieve).join('\n');

      // Send the logs
      message.reply(`Last ${linesToRetrieve} lines of logs:\n\`\`\`\n${logLines}\n\`\`\``);
      logger.debug('Successfully replied with logs');
    } catch (error) {
      logger.error(`An error occurred while reading logs: ${error.message}`);
      message.reply('An error occurred while reading logs.');
    }
  },
};

const logger = require('../../../util/logger.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'logs',
  description: 'Retrieve the latest bot logs.',
  execute(message, args) {
    try {
      logger.debug('Reading bot logs', message.client, 'slash', { interaction: null });

      // Get the number of lines from the command arguments
      const linesToRetrieve = parseInt(args[0]);

      if (isNaN(linesToRetrieve) || linesToRetrieve <= 0) return message.reply('Please enter a valid number of lines.');

      // Read the log file
      const logFilePath = path.join(__dirname, '../../../bot.log');
      let logData = fs.readFileSync(logFilePath, 'utf8').trim();

      // Get the specified number of lines
      const logLines = logData.split('\n').slice(-linesToRetrieve).join('\n');

      // Send the logs
      message.reply(`Last ${linesToRetrieve} lines of logs:\n\`\`\`\n${logLines}\n\`\`\``);
    } catch (error) {
      logger.error(error);
      message.reply('Error reading logs.');
    }
  },
};

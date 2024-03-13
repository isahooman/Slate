const logger = require('../../../components/logger.js');
const { AttachmentBuilder } = require('discord.js');
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
        logger.debug('[Logs Command] Invalid number of lines requested');
        return message.reply('Please enter a valid number of lines to retrieve.');
      }

      // Read the log file
      const logFilePath = path.join(__dirname, '../../../bot.log');
      let logData = fs.readFileSync(logFilePath, 'utf8').trim();
      const logLines = logData.split('\n').slice(-linesToRetrieve).join('\n');

      if (logLines.length > 2000) {
        // If the log data exceeds 2000 characters, send it as a file
        const tempFilePath = path.join(__dirname, '../../../tempLog.txt');
        // Write the logLines to a temporary file
        fs.writeFileSync(tempFilePath, logLines);
        const logFile = new AttachmentBuilder(tempFilePath, { name: 'logs.txt' });
        message.reply({ content: `Here are the last ${linesToRetrieve} lines of logs:`, files: [logFile] })
          .then(() => fs.unlinkSync(tempFilePath))
          .catch(error => logger.error(`[Logs Command] Error sending log file: ${error.message}`));
      } else {
        // If log data is within the limit, send it as a message
        message.reply(`Last ${linesToRetrieve} lines of logs:\n\`\`\`\n${logLines}\n\`\`\``);
      }
      logger.debug('[Logs Command] Successfully replied with logs');
    } catch (error) {
      logger.error(`[Logs Command] An error occurred while reading logs: ${error.message}`);
      message.reply('An error occurred while reading logs.');
    }
  },
};

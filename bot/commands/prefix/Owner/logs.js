const { AttachmentBuilder } = require('discord.js');
const logger = require('../../../components/util/logger.js');
const path = require('path');
const { readFile } = require('../../../components/core/fileHandler');

module.exports = {
  name: 'logs',
  usage: 'logs <number of lines>',
  category: 'Owner',
  allowDM: true,
  description: 'Retrieve the latest bot logs.',
  cooldowns: {
    global: 15000,
  },
  async execute(message, args) {
    try {
      // Get the number of lines from the command arguments
      const linesToRetrieve = parseInt(args[0]);

      if (isNaN(linesToRetrieve) || linesToRetrieve <= 0) {
        logger.debug('[Logs Command] Invalid number of lines requested');
        return message.reply('Please enter a valid number of lines to retrieve.');
      }

      // Read the log file
      const logFilePath = path.join(__dirname, '../../../../output/bot.log');
      let logData = await readFile(logFilePath);

      // Retrieve the log lines
      const allLogLines = logData.split('\n').filter(line => line.trim() !== '');
      const logLines = allLogLines.slice(-linesToRetrieve).join('\n');

      // Send the log lines as an attachment
      const logBuffer = Buffer.from(logLines, 'utf-8');
      const logFile = new AttachmentBuilder(logBuffer, { name: 'logs.txt' });

      await message.reply({ content: `Here are the last ${linesToRetrieve} lines of logs:`, files: [logFile] });

      logger.debug('[Logs Command] Successfully replied with logs');
    } catch (error) {
      message.reply('An error occurred while retrieving the logs. Please check the console.');
      throw new Error(`[Logs Command] An error occurred while reading logs: ${error.message}`);
    }
  },
};

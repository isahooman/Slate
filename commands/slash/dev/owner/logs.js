const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { logger } = require('../../../../components/loggerUtil.js');
const path = require('path');
const { readFile, writeFile, deleteFile } = require('../../../../components/fileHandler.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Retrieve the latest bot logs.')
    .addIntegerOption(option => option.setName('lines')
      .setDescription('Number of lines to retrieve')
      .setRequired(true)),
  category: 'owner',
  async execute(interaction) {
    try {
      logger.debug('[Logs Command] Reading bot logs');
      // Get the number of lines from the command option
      const linesToRetrieve = interaction.options.getInteger('lines');
      if (linesToRetrieve <= 0) return interaction.reply({ content: 'Please enter a valid number of lines.', ephemeral: false });
      logger.debug(`[Logs Command] Requested number of lines: ${linesToRetrieve}`);

      // Read the log file
      const logFilePath = path.join(__dirname, '../../../bot.log');
      let logData = await readFile(logFilePath);

      // Get the specified number of lines
      const logLines = logData.split('\n').slice(-linesToRetrieve).join('\n');

      // Send logs
      if (logLines.length > 2000) {
        // If the log data exceeds 2000 characters, send it as a file
        const tempFilePath = path.join(__dirname, '../../../tempLog.txt');

        // Write the logLines to a temporary file
        await writeFile(tempFilePath, logLines);

        const logFile = new AttachmentBuilder(tempFilePath, { name: 'logs.txt' });
        await interaction.reply({ content: `Here are the last ${linesToRetrieve} lines of logs:`, files: [logFile], ephemeral: false })
          .then(() => deleteFile(tempFilePath))
          .catch(error => logger.error(`[Logs Command] Error sending log file: ${error}`));
      } else {
        // If log data is within limit, send it as a message
        await interaction.reply({ content: `Last ${linesToRetrieve} lines of logs:\n\`\`\`\n${logLines}\n\`\`\``, ephemeral: false });
      }

      logger.debug('[Logs Command] Successfully replied with logs');
    } catch (error) {
      logger.error(`[Logs Command] ${error}`);
      await interaction.reply({ content: 'Error reading logs.', ephemeral: true });
    }
  },
};

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const logger = require('../../../../components/util/logger.js');
const path = require('path');
const { readFile } = require('../../../../components/core/fileHandler.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Retrieve the latest bot logs.')
    .addIntegerOption(option => option.setName('lines')
      .setDescription('Number of lines to retrieve')
      .setRequired(true)),
  category: 'owner',
  async execute(interaction) {
    // Defer reply for potentially long operations
    await interaction.deferReply({ ephemeral: false });
    try {
      logger.debug('[Logs Command] Reading bot logs');
      // Get the number of lines from the command option
      const linesToRetrieve = interaction.options.getInteger('lines');
      if (linesToRetrieve <= 0) return interaction.editReply({ content: 'Please enter a valid number of lines.', ephemeral: false });

      logger.debug(`[Logs Command] Requested number of lines: ${linesToRetrieve}`);

      // Read the log file
      const logFilePath = path.join(__dirname, '../../../../bot.log');
      let logData = await readFile(logFilePath);

      // Get the specified number of lines
      const logLines = logData.split('\n').slice(-linesToRetrieve).join('\n');

      // Always send as a file using a buffer
      const logBuffer = Buffer.from(logLines, 'utf-8');
      const logFile = new AttachmentBuilder(logBuffer, { name: 'logs.txt' });

      await interaction.editReply({ content: `Here are the last ${linesToRetrieve} lines of logs:`, files: [logFile], ephemeral: false });

      logger.debug('[Logs Command] Successfully replied with logs');
    } catch (error) {
      await interaction.editReply({ content: 'An error occurred while retrieving the logs. Please check the console.', ephemeral: true });
      throw new Error(`[Logs Command] ${error}`);
    }
  },
};

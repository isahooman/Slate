const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
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
    await interaction.deferReply();
    try {
      logger.debug('[Logs Command] Reading bot logs');
      // Get the number of lines from the command option
      const linesToRetrieve = interaction.options.getInteger('lines');
      if (linesToRetrieve <= 0) return interaction.editReply({ content: 'Please enter a valid number of lines.' });

      logger.debug(`[Logs Command] Requested number of lines: ${linesToRetrieve}`);

      // Read the log file
      const logFilePath = path.join(__dirname, '../../../../../output/bot.log');
      let logData = await readFile(logFilePath);

      // Get the specified number of lines
      const allLines = logData.split('\n').filter(line => line.trim() !== '');
      const logLines = allLines.slice(-linesToRetrieve).join('\n');

      // Always send as a file using a buffer
      const logBuffer = Buffer.from(logLines, 'utf-8');
      const logFile = new AttachmentBuilder(logBuffer, { name: 'logs.txt' });

      await interaction.editReply({ content: `Here are the last ${linesToRetrieve} lines of logs:`, files: [logFile] });

      logger.debug('[Logs Command] Successfully replied with logs');
    } catch (error) {
      await interaction.editReply({ content: 'An error occurred while retrieving the logs. Please check the console.', flags: MessageFlags.Ephemeral });
      throw new Error(`[Logs Command] ${error}`);
    }
  },
};

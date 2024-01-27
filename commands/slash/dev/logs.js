const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../components/logger.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Retrieve the latest bot logs.')
    .addIntegerOption(option => option.setName('lines')
      .setDescription('Number of lines to retrieve')
      .setRequired(true)),

  async execute(interaction) {
    try {
      logger.debug('Reading bot logs');

      // Get the number of lines from the command option
      const linesToRetrieve = interaction.options.getInteger('lines');
      if (linesToRetrieve <= 0) return interaction.reply({ content: 'Please enter a valid number of lines.', ephemeral: false });
      logger.debug(`Requested number of lines: ${linesToRetrieve}`);

      // Read the log file
      const logFilePath = path.join(__dirname, '../../../bot.log');
      let logData = fs.readFileSync(logFilePath, 'utf8').trim();

      // Get the specified number of lines
      const logLines = logData.split('\n').slice(-linesToRetrieve).join('\n');
      logger.debug(`Successfully retrieved ${linesToRetrieve} lines from logs`);

      // Send the logs
      await interaction.reply({ content: `Last ${linesToRetrieve} lines of logs:\n\`\`\`\n${logLines}\n\`\`\``, ephemeral: false });
      logger.debug('Successfully replied with logs');
    } catch (error) {
      logger.error(error);
      await interaction.reply({ content: 'Error reading logs.', ephemeral: true });
    }
  },
};

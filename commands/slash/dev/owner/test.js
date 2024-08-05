const { SlashCommandBuilder } = require('discord.js');
const { logger } = require('../../../../components/loggerUtil.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test command with subcommands and options')
    .addSubcommand(subcommand => subcommand
      .setName('subcommand1')
      .setDescription('Subcommand 1 description')
      .addStringOption(option => option.setName('option1')
        .setDescription('Option 1 for subcommand 1')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('subcommand2')
      .setDescription('Subcommand 2 description')
      .addIntegerOption(option => option.setName('option2')
        .setDescription('Option 2 for subcommand 2')
        .setRequired(false))),
  category: 'owner',
  async execute(interaction) {
    // Check if a subcommand is present
    const subcommand = interaction.options.getSubcommand(false);

    // Log the subcommand being read or warn if it's blank
    if (!subcommand) {
      logger.warn('[Test Command] No subcommand was provided.');
      await interaction.reply({ content: 'No subcommand was specified.', ephemeral: true });
      return;
    }

    logger.debug(`[Test Command] Processing test command with subcommand: ${subcommand}`);

    try {
      if (subcommand === 'subcommand1') {
        const option1Value = interaction.options.getString('option1');
        logger.info(`[Test Command] Executing subcommand1 with option1: ${option1Value}`);
        await interaction.reply(`Subcommand1 executed with option1: ${option1Value}`);
      } else if (subcommand === 'subcommand2') {
        const option2Value = interaction.options.getInteger('option2') || 'Not provided';
        logger.info(`[Test Command] Executing subcommand2 with option2: ${option2Value}`);
        await interaction.reply(`Subcommand2 executed with option2: ${option2Value}`);
      }
    } catch (error) {
      logger.error(`[Test Command] An error occurred while executing the test command: ${error.message}`);
      await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
    }
  },
};

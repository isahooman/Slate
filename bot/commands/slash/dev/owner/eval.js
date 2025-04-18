const logger = require('../../../../components/util/logger.js');
const Discord = require('discord.js');
const { inspect } = require('node:util');

/**
 * Returns an array of messages, each 1950 characters long.
 * @param {string} str - A given String
 * @returns {Array} Array of Strings
 * @author EthanLawr
 */
const chunks = str => str.match(/.{1,1950}/gms);

/**
 * Returns a formatted version of the given time
 * @param {bigint} time - BigInt of nanoseconds
 * @returns {string} Formatted String
 * @author EthanLawr
 */
const cleanTime = time => {
  time = Number(time);
  if (time / 1000000000 > 1) return `${cleanNumber(time / 1000000000)}s`;
  else if (time / 1000000 > 1) return `${cleanNumber(time / 1000000)}ms`;
  else if (time / 1000 > 1) return `${cleanNumber(time / 1000)}μs`;
  else return `${time}ns`;
};

/**
 * Returns a number floored to the nearest 100th
 * @param {number} num - A given Number
 * @returns {number} Floored Number
 * @author EthanLawr
 */
const cleanNumber = num => (~~(num * 100) / 100).toFixed(2);

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate code using the eval() function')
    .addStringOption(option => option.setName('code')
      .setDescription('Code to evaluate')
      .setRequired(true)),
  category: 'owner',

  /**
   * Executes the Eval Slash command
   * @param {Discord.Interaction} interaction - Discord Command Interaction
   * @author EthanLawr
   */
  async execute(interaction) {
    try {
      // Log the start of the evaluation
      logger.debug(`[Eval Command] Starting to evaluate given code`);

      await interaction.deferReply();
      let evaluationTime = process.hrtime.bigint();
      let evaledCode = await eval(interaction.options.getString('code'));
      if (typeof evaledCode !== 'string') evaledCode = inspect(evaledCode);
      let formattedEvaledCode = chunks(evaledCode);
      evaluationTime = `${cleanTime(process.hrtime.bigint() - evaluationTime)}`;
      if (formattedEvaledCode.length > 1) interaction.editReply({ content: `Evaluation took ${evaluationTime} to execute.
        \`\`\`js\n${formattedEvaledCode[0].length === 1980 ?
    `${formattedEvaledCode[0]}\nOutput too long` :
    formattedEvaledCode[0]}\n\`\`\``,
      files: [
        new Discord.AttachmentBuilder(Buffer.from(evaledCode, 'utf8'),
          {
            name: 'Evaluation.js',
          },
        ),
      ] });
      else interaction.editReply({ content: `Evaluation took ${evaluationTime} to execute.
      \`\`\`js\n${formattedEvaledCode[0].length === 1980 ?
    `${formattedEvaledCode[0]}\nOutput too long` :
    formattedEvaledCode[0]}\n\`\`\``,
      });

      // Log the end of the evaluation
      logger.debug(`[Eval Command] Ending evaluation. Evaluation took ${evaluationTime}ms.`);
    } catch (error) {
      throw new Error(`[Eval Command] Error while evaluating code: ${error}`);
    }
  },
};

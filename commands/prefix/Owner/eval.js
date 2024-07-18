/* eslint-disable no-unused-vars */
const { logger } = require('../../../components/loggerUtil.js');
const Discord = require('discord.js');
const { inspect } = require('node:util');
const { client } = require('../../../bot.js');

/**
 * Returns an array of messages, each 1950 characters long.
 * @param {string} str - A given String
 * @returns {Array} Array of Strings
 * @author EthanLawr
 */
const chunks = str => str.match(/.{1,1930}/gms);

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
  name: 'eval',
  usage: 'eval <code>',
  category: 'Owner',
  allowDM: true,
  description: 'Evaluates code',

  /**
   * Executes the Eval command
   * @param {Discord.message} message - A Discord Message
   * @author EthanLawr
   */
  async execute(message) {
    try {
      // Log the start of the evaluation
      logger.debug(`[Eval Command] Starting to evaluate given code`);
      let evaluationTime = process.hrtime.bigint();
      let evaledCode = await eval(message.content.split(' ').slice(1).join(' '));
      if (typeof evaledCode !== 'string') evaledCode = inspect(evaledCode);
      let formattedEvaledCode = chunks(evaledCode);
      evaluationTime = `${cleanTime(process.hrtime.bigint() - evaluationTime)}`;
      if (formattedEvaledCode.length > 1) message.channel.send({ content: `Evaluation took ${evaluationTime} to execute.
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
      else message.channel.send({ content: `Evaluation took ${evaluationTime} to execute.
        \`\`\`js\n${formattedEvaledCode[0].length === 1980 ?
    `${formattedEvaledCode[0]}\nOutput too long` :
    formattedEvaledCode[0]}\n\`\`\``,
      });

      // Log the end of the evaluation
      logger.debug(`[Eval Command] Ending evaluation. Evaluation took ${evaluationTime}ms.`);
    } catch (error) {
      process.stderr.write(`[Eval Command] Error while evaluating code: ${error}\n`);
      await message.channel.send({ content: `\`ERROR\`\n\`\`\`js\n${error}\`\`\`` });
    }
  },
};

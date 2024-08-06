const { EmbedBuilder } = require('discord.js');
const { logger } = require('../../../components/loggerUtil.js');
const math = require('mathjs');

module.exports = {
  name: 'math',
  usage: 'math <equation>',
  category: 'Utility',
  allowDM: true,
  description: 'Calculates math equations.',
  execute(message, args) {
    if (!args.length) {
      logger.warn('[Math Command] No equation provided.');
      return message.channel.send('Please provide an equation to calculate.');
    }

    let equation = args.join(' ');
    logger.debug(`[Math Command] Received equation: ${equation}`);

    // Check for incomplete equations using a regular expression
    const incompleteEquationRegex = /^\s*[+\-*/%^()]\s*$/;
    if (incompleteEquationRegex.test(equation)) {
      logger.warn('[Math Command] Incomplete equation provided.');
      return message.channel.send('Please provide a complete equation.');
    }

    try {
      // Evaluate the equation
      let result = math.evaluate(equation);

      // Create an embed
      const embed = new EmbedBuilder()
        .setTitle('Math Calculation')
        .setDescription(`**Equation:**\n\`\`\`js\n${equation}\`\`\`\n**Result:**\n\`\`\`js\n${result}\`\`\``);

      // Send the embed to the user
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      logger.debug(`[Math Command] Equation at error: ${equation}`);
      message.channel.send('Invalid equation.');
    }
  },
};

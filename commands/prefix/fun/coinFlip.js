const { logger } = require('../../../components/loggerUtil.js');

module.exports = {
  name: 'coinflip',
  usage: 'coinflip <heads/tails>',
  category: 'fun',
  aliases: ['cf'],
  allowDM: true,
  description: 'Flip a coin!',
  execute(message, args) {
    // Generate flip result
    const result = ['heads', 'tails'][Math.floor(Math.random() * 2)];
    logger.debug(`[Coinflip Command] Coin flip result: ${result}`);

    // Check if a choice was provided.
    if (!args[0]) {
      logger.debug(`[Coinflip Command] User did not provide a choice (heads/tails)`);
      // Reply with result
      return message.channel.send(`The coin landed on **${result}**!`);
    }

    const userChoice = args[0].toLowerCase();
    logger.debug(`[Coinflip Command] User choice: ${userChoice}`);

    let outcome = 'lost';
    if (userChoice === result) {
      outcome = 'won';
      logger.info(`[Coinflip Command] User ${message.author.tag} won the coin flip`);
    } else {
      logger.info(`[Coinflip Command] User ${message.author.tag} lost the coin flip`);
    }

    // Reply based on users' choice
    message.channel.send(`The coin landed on **${result}**! You **${outcome}**!`);
  },
};

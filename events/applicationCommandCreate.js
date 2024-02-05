const logger = require('../components/logger.js');

module.exports = {
  name: 'applicationCommandCreate',
  execute(command) {
    logger.info(`Application command created: (${command.name} | (${command.id}) in Server: ${command.guild ? command.guild.name : 'Global'}`);
  },
};

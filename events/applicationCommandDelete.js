const logger = require('../components/logger.js');

module.exports = {
  name: 'applicationCommandDelete',
  execute(command) {
    logger.info(`Application command deleted: (${command.name} | ${command.id}) in Server: ${command.guild ? command.guild.name : 'Global'}`);
  },
};

const { deployCommands } = require('../../../components/loader.js');
const { logger } = require('../../../components/loggerUtil.js');

module.exports = {
  name: 'deploy',
  usage: 'deploy',
  category: 'Owner',
  allowDM: true,
  description: 'Deploy all slash commands.',
  cooldowns: {
    global: 60000,
  },
  async execute(message) {
    try {
      await deployCommands();
      message.reply('Slash commands deployed successfully!');
    } catch (error) {
      logger.error(`[Deploy Command] Error while deploying slash commands: ${error}`);
      message.reply('Failed to deploy slash commands.');
    }
  },
};

const deployCommands = require('../../../components/deploy.js');
const logger = require('../../../components/logger.js');

module.exports = {
  name: 'deploy',
  usage: 'deploy',
  category: 'Owner',
  description: 'Deploys global and guild-specific commands',
  async execute(message) {
    try {
      await deployCommands();
      message.reply('Slash commands deployed successfully!');
    } catch (error) {
      logger.error(`Deployment error: ${error}`);
      message.reply('Failed to deploy slash commands.');
    }
  },
};

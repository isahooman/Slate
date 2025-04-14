const { deployCommands } = require('../../../components/core/loader');

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
      throw new Error(`[Deploy Command] Error while deploying slash commands: ${error}`);
    }
  },
};

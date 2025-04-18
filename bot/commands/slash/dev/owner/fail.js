const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fail')
    .setDescription('Intentionally fail for testing.'),
  category: 'owner',
  cooldowns: {
    user: 3000,
    guild: 4000,
    global: 5000,
  },
  execute() {
    throw new Error('This is a test error.');
  },
};

const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'voiceStateUpdate',
  execute(oldState, newState) {
    logger.info(`Voice state updated;
      User: ${newState.member.user.tag} | ${newState.member.user.id},
      Guild: ${newState.guild.name} | ${newState.guild.id},
      Old Channel: ${oldState.channel ? oldState.channel.name : 'N/A'} | ${oldState.channelID || 'N/A'},
      New Channel: ${newState.channel ? newState.channel.name : 'N/A'} | ${newState.channelID || 'N/A'},
      Updated At: ${new Date().toISOString()}
    `);
  },
};

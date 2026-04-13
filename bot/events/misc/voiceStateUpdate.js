const logger = require('#components/util/logger.js');

module.exports = {
  name: 'voiceStateUpdate',
  execute(oldState, newState) {
    logger.info(`Voice state updated;
      User: ${newState.member.user.tag} | ${newState.member.user.id},
      Guild: ${newState.guild.name} | ${newState.guild.id},
      Old Channel: ${oldState.channel ? oldState.channel.name : 'N/A'} | ${oldState.channelId || 'N/A'},
      New Channel: ${newState.channel ? newState.channel.name : 'N/A'} | ${newState.channelId || 'N/A'},
      Updated At: ${new Date().toISOString()}
    `);
  },
};

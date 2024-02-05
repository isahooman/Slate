const logger = require('../components/logger.js');

module.exports = {
  name: 'stageInstanceUpdate',
  execute(oldStageInstance, newStageInstance) {
    logger.info(`Stage instance updated;
      ID: ${newStageInstance.id},
      Guild: ${newStageInstance.guild.name} | ${newStageInstance.guild.id},
      Old Topic: ${oldStageInstance.topic || 'N/A'},
      New Topic: ${newStageInstance.topic || 'N/A'},
      Old Privacy Level: ${oldStageInstance.privacyLevel},
      New Privacy Level: ${newStageInstance.privacyLevel},
      Updated At: ${new Date().toISOString()}
    `);
  },
};

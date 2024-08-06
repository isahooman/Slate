const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'stageInstanceDelete',
  execute(stageInstance) {
    logger.info(`Stage instance deleted;
      ID: ${stageInstance.id},
      Guild: ${stageInstance.guild.name} | ${stageInstance.guild.id},
      Topic: ${stageInstance.topic || 'N/A'},
      Privacy Level: ${stageInstance.privacyLevel},
      Deleted At: ${new Date().toISOString()}
    `);
  },
};

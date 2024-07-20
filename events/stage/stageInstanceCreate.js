const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'stageInstanceCreate',
  execute(stageInstance) {
    logger.info(`Stage instance created;
      ID: ${stageInstance.id},
      Guild: ${stageInstance.guild.name} | ${stageInstance.guild.id},
      Topic: ${stageInstance.topic || 'N/A'},
      Privacy Level: ${stageInstance.privacyLevel},
      Created At: ${stageInstance.createdAt.toISOString()}
    `);
  },
};

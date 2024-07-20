const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'stageInstanceUpdate',
  execute(oldStageInstance, newStageInstance) {
    const logDetails = [];

    // Check stage instance topic
    if (oldStageInstance.topic !== newStageInstance.topic) logDetails.push(`Topic: ${oldStageInstance.topic || 'None'} -> ${newStageInstance.topic || 'None'}`);

    // Check stage instance privacy level
    if (oldStageInstance.privacyLevel !== newStageInstance.privacyLevel) logDetails.push(`Privacy Level: ${oldStageInstance.privacyLevel} -> ${newStageInstance.privacyLevel}`);

    // Check stage instance discoverable
    if (oldStageInstance.discoverableDisabled !== newStageInstance.discoverableDisabled) logDetails.push(`Discoverable: ${oldStageInstance.discoverableDisabled ? 'No' : 'Yes'} -> ${newStageInstance.discoverableDisabled ? 'No' : 'Yes'}`);

    // Log changed information
    if (logDetails.length > 0) logger.info(`Stage instance updated;
        Stage Instance ID: ${newStageInstance.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);
  },
};

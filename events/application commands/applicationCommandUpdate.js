const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'applicationCommandUpdate',
  execute(oldCommand, newCommand) {
    const logDetails = [];

    // Check command name
    if (oldCommand.name !== newCommand.name) logDetails.push(`Name: ${oldCommand.name} -> ${newCommand.name}`);

    // Check command type
    if (oldCommand.type !== newCommand.type) logDetails.push(`Type: ${oldCommand.type} -> ${newCommand.type}`);

    // Check command ID
    if (oldCommand.id !== newCommand.id) logDetails.push(`ID: ${oldCommand.id} -> ${newCommand.id}`);

    // Check application ID
    if (oldCommand.applicationId !== newCommand.applicationId) logDetails.push(`Application ID: ${oldCommand.applicationId} -> ${newCommand.applicationId}`);

    // Check guild ID
    if (oldCommand.guildId !== newCommand.guildId) logDetails.push(`Guild ID: ${oldCommand.guildId || 'Global Command'} -> ${newCommand.guildId || 'Global Command'}`);

    // Log changed information
    if (logDetails.length > 0) logger.info(`Application command updated;
        Name: ${oldCommand.name},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);
  },
};

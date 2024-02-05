const logger = require('../components/logger.js');

module.exports = {
  name: 'threadUpdate',
  execute(oldThread, newThread) {
    const logDetails = [];

    // Check and log thread name change
    if (oldThread.name !== newThread.name) logDetails.push(`Name: ${oldThread.name} -> ${newThread.name}`);

    // Log information when any change is detected
    if (logDetails.length > 0) logger.info(`Thread updated;
        Thread Name: ${newThread.name} | ${newThread.id},
        Updated At: ${new Date().toISOString()},
        Guild: ${newThread.guild.name} | ${newThread.guild.id},
        Parent Channel: ${newThread.parent.name} | ${newThread.parent.id},
        ${logDetails.join('\n')}
      `);
  },
};

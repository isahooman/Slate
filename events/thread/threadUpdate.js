const { logger } = require('../../components/loggerUtil.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'threadUpdate',
  execute(oldThread, newThread) {
    const logDetails = [];

    // Check name
    if (oldThread.name !== newThread.name) logDetails.push(`Name: ${oldThread.name} -> ${newThread.name}`);

    // Check archived state
    if (oldThread.archived !== newThread.archived) logDetails.push(`Archived: ${oldThread.archived ? 'Yes' : 'No'} -> ${newThread.archived ? 'Yes' : 'No'}`);

    // Check locked state
    if (oldThread.locked !== newThread.locked) logDetails.push(`Locked: ${oldThread.locked ? 'Yes' : 'No'} -> ${newThread.locked ? 'Yes' : 'No'}`);

    // Check auto-archive duration
    if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) logDetails.push(`Auto-Archive Duration: ${oldThread.autoArchiveDuration} minutes -> ${newThread.autoArchiveDuration} minutes`);

    // Log changed information
    if (logDetails.length > 0) logger.info(`Thread updated;
        Thread Name: ${newThread.name} | ${newThread.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);

    // Update thread cache
    cache.updateThread(newThread);
  },
};

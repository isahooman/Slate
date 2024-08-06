const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'presenceUpdate',
  execute(oldPresence, newPresence) {
    logger.info(`Presence updated;
      User: ${newPresence.user.tag} | ${newPresence.user.id},
      Status: ${newPresence.status} -> ${newPresence.user.presence.status},
      Activity: ${newPresence.activities.map(activity => activity.name).join(', ') || 'N/A'},
      Updated At: ${new Date().toISOString()}
    `);
  },
};

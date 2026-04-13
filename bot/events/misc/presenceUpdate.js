const logger = require('#components/util/logger.js');

module.exports = {
  name: 'presenceUpdate',
  execute(oldPresence, newPresence) {
    logger.info(`Presence updated;
      User: ${newPresence.user.tag} | ${newPresence.user.id},
      Status: ${oldPresence?.status ?? 'N/A'} -> ${newPresence.status},
      Activity: ${newPresence.activities.map(activity => activity.name).join(', ') || 'N/A'},
      Updated At: ${new Date().toISOString()}
    `);
  },
};

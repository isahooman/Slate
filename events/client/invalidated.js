const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'invalidated',
  once: false,
  execute(invalidateInfo) {
    logger.info(`Token invalidated;
      Reason: ${invalidateInfo.reason},
      User ID: ${invalidateInfo.userId},
    `);
  },
};

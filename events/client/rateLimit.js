const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'rateLimit',
  execute(rateLimitInfo) {
    logger.warn(`Rate limit hit;
      Timeout: ${rateLimitInfo.timeout}ms,
      Limit: ${rateLimitInfo.limit},
      Method: ${rateLimitInfo.method},
      Path: ${rateLimitInfo.path},
      Route: ${rateLimitInfo.route},
      Global: ${rateLimitInfo.global},
    `);
  },
};

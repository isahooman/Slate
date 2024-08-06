const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'invalidRequestWarning',
  execute(requestInfo) {
    logger.warn(`Invalid request received:
      Request Info: ${JSON.stringify(requestInfo)},
      User Agent: ${requestInfo.userAgent},
      IP Address: ${requestInfo.ipAddress},
      URL: ${requestInfo.url},
      HTTP Method: ${requestInfo.method},
      Headers: ${JSON.stringify(requestInfo.headers)},
      Request Body: ${JSON.stringify(requestInfo.body)},
    `);
  },
};

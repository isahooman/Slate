const logger = require('../components/logger.js');

module.exports = {
  name: 'webhookUpdate',
  execute(channel) {
    logger.info(`Webhook updated;
      Channel: ${channel.name} | ${channel.id},
      Guild: ${channel.guild.name} | ${channel.guild.id},
      Updated At: ${new Date().toISOString()}
    `);
  },
};

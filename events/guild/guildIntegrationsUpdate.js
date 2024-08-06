const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'guildIntegrationsUpdate',
  execute(guild) {
    const updatedIntegrations = guild.integrations.cache.array();

    logger.info(`Guild integrations updated;
      Guild Name: ${guild.name} | ${guild.id},
      Updated At: ${new Date().toISOString()},
      Updated Integrations: ${updatedIntegrations.length > 0 ? updatedIntegrations.map(integration => `${integration.name}: ${integration.type}`).join(', ') : 'None'}
    `);
  },
};

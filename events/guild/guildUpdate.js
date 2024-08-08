const { logger } = require('../../components/loggerUtil.js');
const { cache } = require('../../bot.js');

module.exports = {
  name: 'guildUpdate',
  execute(oldGuild, newGuild) {
    const logDetails = [];

    // Check region
    if (oldGuild.region !== newGuild.region) logDetails.push(`Region: ${oldGuild.region} -> ${newGuild.region}`);

    // Check owner
    if (oldGuild.ownerID !== newGuild.ownerID) logDetails.push(`Owner: ${oldGuild.owner.user.tag} | ${oldGuild.ownerID} -> ${newGuild.owner.user.tag} | ${newGuild.ownerID}`);

    // Check verification level
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) logDetails.push(`Verification Level: ${oldGuild.verificationLevel} -> ${newGuild.verificationLevel}`);

    // Check features
    if (oldGuild.features.join(',') !== newGuild.features.join(',')) logDetails.push(`Features: ${oldGuild.features.join(', ') || 'N/A'} -> ${newGuild.features.join(', ') || 'N/A'}`);

    // Check large guild
    if (oldGuild.large !== newGuild.large) logDetails.push(`Large Guild: ${oldGuild.large ? 'Yes' : 'No'} -> ${newGuild.large ? 'Yes' : 'No'}`);

    // Check bot count
    const oldBotCount = oldGuild.members.cache.filter(member => member.user.bot).size;
    const newBotCount = newGuild.members.cache.filter(member => member.user.bot).size;
    if (oldBotCount !== newBotCount) logDetails.push(`Bot Count: ${oldBotCount} -> ${newBotCount}`);

    // Check roles
    const oldRoles = oldGuild.roles.cache.map(role => `${role.name}: ${role.members.size}`);
    const newRoles = newGuild.roles.cache.map(role => `${role.name}: ${role.members.size}`);
    if (oldRoles.join(',') !== newRoles.join(',')) logDetails.push(`Roles: ${oldRoles.join(', ') || 'N/A'} -> ${newRoles.join(', ') || 'N/A'}`);

    // Log changed information
    if (logDetails.length > 0) logger.info(`Guild updated;
        Guild Name: ${newGuild.name} | ${newGuild.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);

    // Update guild cache
    cache.updateGuild(newGuild);
  },
};

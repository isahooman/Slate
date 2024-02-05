const logger = require('../components/logger.js');

module.exports = {
  name: 'guildUpdate',
  execute(oldGuild, newGuild) {
    const logDetails = [];

    // Check and log region change
    if (oldGuild.region !== newGuild.region) logDetails.push(`Region: ${oldGuild.region} -> ${newGuild.region}`);

    // Check and log owner change
    if (oldGuild.ownerID !== newGuild.ownerID) logDetails.push(`Owner: ${oldGuild.owner.user.tag} (${oldGuild.ownerID}) -> ${newGuild.owner.user.tag} (${newGuild.ownerID})`);

    // Check and log verification level change
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) logDetails.push(`Verification Level: ${oldGuild.verificationLevel} -> ${newGuild.verificationLevel}`);

    // Check and log features change
    if (oldGuild.features.join(',') !== newGuild.features.join(',')) logDetails.push(`Features: ${oldGuild.features.join(', ') || 'N/A'} -> ${newGuild.features.join(', ') || 'N/A'}`);

    // Check and log large guild change
    if (oldGuild.large !== newGuild.large) logDetails.push(`Large Guild: ${oldGuild.large ? 'Yes' : 'No'} -> ${newGuild.large ? 'Yes' : 'No'}`);

    // Check and log bot count change
    const oldBotCount = oldGuild.members.cache.filter(member => member.user.bot).size;
    const newBotCount = newGuild.members.cache.filter(member => member.user.bot).size;
    if (oldBotCount !== newBotCount) logDetails.push(`Bot Count: ${oldBotCount} -> ${newBotCount}`);

    // Check and log roles change
    const oldRoles = oldGuild.roles.cache.map(role => `${role.name}: ${role.members.size}`);
    const newRoles = newGuild.roles.cache.map(role => `${role.name}: ${role.members.size}`);
    if (oldRoles.join(',') !== newRoles.join(',')) logDetails.push(`Roles: ${oldRoles.join(', ') || 'N/A'} -> ${newRoles.join(', ') || 'N/A'}`);

    // Log information when any change is detected
    if (logDetails.length > 0) logger.info(`Guild updated;
        Guild Name: ${newGuild.name} | ${newGuild.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);
  },
};

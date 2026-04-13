const logger = require('#components/util/logger.js');
const { cache } = require('#bot');

module.exports = {
  name: 'guildUpdate',
  async execute(oldGuild, newGuild) {
    const logDetails = [];

    // Check owner
    if (oldGuild.ownerId !== newGuild.ownerId) {
      const newOwner = await newGuild.fetchOwner();
      logDetails.push(`Owner: ${oldGuild.ownerId} -> ${newOwner.user.tag} | ${newGuild.ownerId}`);
    }

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

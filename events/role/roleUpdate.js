const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'roleUpdate',
  execute(oldRole, newRole) {
    const logDetails = [];

    // Check role name
    if (oldRole.name !== newRole.name) logDetails.push(`Name: ${oldRole.name} -> ${newRole.name}`);

    // Check role color
    if (oldRole.color !== newRole.color) logDetails.push(`Color: ${oldRole.color} -> ${newRole.color}`);

    // Check role permissions
    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) logDetails.push(`Permissions Changed`);

    // Check role position
    if (oldRole.position !== newRole.position) logDetails.push(`Position: ${oldRole.position} -> ${newRole.position}`);

    // Check role hoist
    if (oldRole.hoist !== newRole.hoist) logDetails.push(`Hoist: ${oldRole.hoist ? 'Yes' : 'No'} -> ${newRole.hoist ? 'Yes' : 'No'}`);

    // Check role mentionable
    if (oldRole.mentionable !== newRole.mentionable) logDetails.push(`Mentionable: ${oldRole.mentionable ? 'Yes' : 'No'} -> ${newRole.mentionable ? 'Yes' : 'No'}`);

    // Log changed information
    if (logDetails.length > 0) logger.info(`Role updated;
        Role Name: ${newRole.name} | ${newRole.id},
        Updated At: ${new Date().toISOString()},
        ${logDetails.join('\n')}
      `);
  },
};

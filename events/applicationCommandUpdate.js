const logger = require('../components/logger.js');

module.exports = {
  name: 'applicationCommandUpdate',
  execute(oldCommand, newCommand) {
    let changes = [];
    // check for name changes
    if (oldCommand.name !== newCommand.name) changes.push(`name: from "${oldCommand.name}" to "${newCommand.name}"`);

    // check for description changes
    if (oldCommand.description !== newCommand.description) changes.push(`description: from "${oldCommand.description}" to "${newCommand.description}"`);

    // if changes, log changes
    if (changes.length > 0) logger.info(`Application command updated: ${oldCommand.name} | ID: ${oldCommand.id} | Server: ${oldCommand.guild ? oldCommand.guild.name : 'Global'}. Changes: ${changes.join(', ')}`);
  },
};

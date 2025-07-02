const logger = require('../../components/util/logger.js');

module.exports = {
  name: 'guildMembersChunk',
  execute(members, guild) {
    logger.info(`Received a chunk of guild members;
      Guild: ${guild.name} | ${guild.id},
      Member Count in Chunk: ${members.size},
      Received At: ${new Date().toISOString()}
    `);
  },
};

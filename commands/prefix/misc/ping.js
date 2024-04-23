const moment = require('moment'); require('moment-duration-format');
const logger = require('../../../components/logger.js');

module.exports = {
  name: 'ping', // Command name
  usage: 'ping', // example of how the command should be used by the user
  category: 'misc', // Category of the command
  aliases: ['p'], // Aliases provide alternate names for the command.
  nsfw: false, // Mark command as nsfw, this allows the command to only be used in age-restricted channel
  allowDM: false, // If the command is allowed to be used in direct messages or not
  description: 'Check the bot\'s response time.', // Brief description of what the command does
  execute(message) {
    // Log the start of the command
    logger.debug(`[Ping Command] Starting ping, calculation for user: ${message.author.username}`);

    // Get uptime from the node process
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');

    // Get response time from the client
    const botPing = message.client.ws.ping;

    logger.debug(`[Ping Command] Ping calculated: ${botPing}ms, Uptime: ${uptime}`);

    // Send response
    message.channel.send(`<@${message.author.id}> Pong!\n\nMy ping: \`${botPing}ms\`\nMy uptime: \`${uptime}\``);
  },
};

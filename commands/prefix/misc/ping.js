const moment = require('moment'); require('moment-duration-format');
const logger = require('../../../util/logger');

module.exports = {
  name: 'ping',
  usage: 'ping',
  category: 'misc',
  description: 'Check the bot\'s response time.',
  execute(message) {
    const user = message.author;
    logger.debug(`Starting ping calculation for ${user.tag}`);

    // Get uptime from the node process
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');
    // Get response time from the client
    const botPing = message.client.ws.ping;
    logger.debug(`Ping calculated: ${botPing}ms, Uptime: ${uptime}`);
    // Send reponse
    message.channel.send(`<@${user.id}> Pong!\n\nBot's ping: \`${botPing}ms\`\nBot's uptime: \`${uptime}\``);
  },
};

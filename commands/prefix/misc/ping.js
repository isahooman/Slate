const moment = require('moment'); require('moment-duration-format');
const logger = require('../../../util/logger');

module.exports = {
  name: 'ping',
  category: 'Misc',
  description: 'Check the bot\'s response time.',
  usage: 'ping',
  execute(message) {
    logger.debug(`Starting ping calculation for ${user.tag}`, message.client, 'prefix', { commandName: this.name, args: [], context: message });
    const user = message.author;

    // Get uptime from the node process
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');

    // Get response time from the client
    const botPing = message.client.ws.ping;
    logger.debug(`Ping calculated: ${botPing}ms, Uptime: ${uptime}`, message.client, 'prefix', { commandName: this.name, args: [], context: message });

    // Send reponse
    message.channel.send(`<@${user.id}> Pong!\n\nBot's ping: \`${botPing}ms\`\nBot's uptime: \`${uptime}\``);
  },
};

const moment = require('moment'); require('moment-duration-format');
const logger = require('../../../util/logger');

module.exports = {
  name: 'ping',
  description: 'Check the bot ping and uptime.',
  execute(message) {
    const user = message.author;
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');
    const botPing = message.client.ws.ping;

    logger.debug(`Starting ping calculation for ${user.tag}`, message.client, 'prefix', { commandName: this.name, args: [], context: message });
    logger.debug(`Ping calculated: ${botPing}ms, Uptime: ${uptime}`, message.client, 'prefix', { commandName: this.name, args: [], context: message });

    message.channel.send(`<@${user.id}> Pong!\nBot's ping: ${botPing}ms\nBot's uptime: ${uptime}`);
  },
};

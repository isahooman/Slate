const logger = require('../../logger.js');
require('moment-duration-format');
const moment = require('moment');

module.exports = {
    name: 'ping',
    description: 'Check the bot ping and uptime.',
    execute(message) {
        const user = message.author;
        const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');

        logger.debug(`Starting ping calculation for ${user.tag}`, message.client, 'prefix', { commandName: this.name, args: [], context: message });

        const startTime = process.hrtime();
        for (let i = 0; i < 1000000; i++) {}
        const endTime = process.hrtime(startTime);
        const processingSpeed = `${(endTime[0] * 1000 + endTime[1] / 1000000).toFixed(3)}ms`;
        const botPing = message.client.ws.ping;

        logger.debug(`Ping calculated: ${botPing}ms, Processing Speed: ${processingSpeed}, Uptime: ${uptime}`, message.client, 'prefix', { commandName: this.name, args: [], context: message });

        message.channel.send(`<@${user.id}> Pong!\nBot's ping: ${botPing}ms\n\nBot uptime: ${uptime}\nProcessing Speed: ${processingSpeed}`);
    },
};

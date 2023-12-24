'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment');
require('moment-duration-format');
const logger = require('../../../logger.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot ping and uptime.'),
    async execute(interaction) {
        const user = interaction.member.user;
        const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');

        logger.debug(`Starting ping calculation for ${user.tag}`, interaction.client, 'slash', { interaction });

        const startTime = process.hrtime();
        for (let i = 0; i < 1000000; i++) {
        }
        const endTime = process.hrtime(startTime);
        const processingSpeed = `${(endTime[0] * 1000 + endTime[1] / 1000000).toFixed(3)}ms`;
        const botPing = interaction.client.ws.ping;

        logger.debug(`Ping calculated: ${botPing}ms, Processing Speed: ${processingSpeed}, Uptime: ${uptime}`, interaction.client, 'slash', { interaction });

        await interaction.reply(`<@${user.id}> Pong!\nBot's ping: ${botPing}ms\n\nBot uptime: ${uptime}\nProcessing Speed: ${processingSpeed}`);
    }
};

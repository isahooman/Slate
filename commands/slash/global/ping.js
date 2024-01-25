const moment = require('moment'); require('moment-duration-format');
const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../util/logger.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot ping and uptime.'),

  async execute(interaction) {
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');

    // Get ping from bot client
    logger.debug(`Starting ping calculation for ${interaction.member.user.tag}`);
    const botPing = interaction.client.ws.ping;
    logger.debug(`Ping calculated: ${botPing}ms, Uptime: ${uptime}`);

    // Reply to user
    await interaction.reply(`<@${interaction.member.user.id}> Pong!\nBot's ping: ${botPing}ms\nBot uptime: ${uptime}\n`);
  },
};

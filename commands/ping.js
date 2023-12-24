'use strict';
const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot ping and uptime.'),
  async execute(interaction) {
    const user = interaction.member.user;
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');
    const responseDelay = moment.duration(moment() - moment(interaction.createdTimestamp)).asMilliseconds();

    await interaction.reply(`<@${user.id}> Pong!\nBot uptime: ${uptime}\nResponse delay: ${responseDelay}ms`);
  }
};

const moment = require('moment'); require('moment-duration-format');
const logger = require('../../../components/logger.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot ping and uptime.'),

  async execute(interaction) {
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');

    // Get ping from bot client
    logger.debug(`[Ping Command] Starting ping calculation for ${interaction.member?.user.tag || interaction.user.tag}`);
    const botPing = interaction.client.ws.ping;
    logger.debug(`[Ping Command] Ping calculated: ${botPing}ms, Uptime: ${uptime}`);

    // Reply to user
    if (interaction.guild) await interaction.reply(`<@${interaction.user.id}> Pong!\n\`\`\`GraphQL\nMy ping: ${botPing}ms\nMy uptime: ${uptime}\n\`\`\``);
    else await interaction.reply(`Pong!\n\`\`\`GraphQL\nMy ping: ${botPing}ms\nMy uptime: ${uptime}\n\`\`\``, { ephemeral: true });
  },
};

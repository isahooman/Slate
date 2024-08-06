const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment'); require('moment-duration-format');
const { logger } = require('../../../../components/loggerUtil.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping') // Command name
    .setDescription('Check the bot\'s response time.') // Brief description of what the command does
    .setNSFW(false) // Age-Restrict this command allowing it to only be used in age-restricted channels
    .setDMPermission(false),
  category: 'misc',
  cooldowns: {
    user: 3000,
    guild: 4000,
    global: 5000,
  },
  async execute(interaction) {
    // Log the start of the command
    logger.debug(`[Ping Command] Starting ping, calculation for user: ${interaction.user.username}`);

    const startTime = Date.now();
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');
    const botPing = interaction.client.ws.ping;

    await interaction.reply('Pinging...');

    let embedColor;
    if (botPing < 75) embedColor = '#00ff37';
    else if (botPing < 150) embedColor = '#FFC107';
    else embedColor = '#F44336';

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('Pong!')
      .addFields(
        { name: 'Response time', value: `${Date.now() - startTime}ms`, inline: false },
        { name: 'Websocket Ping', value: `${botPing}ms`, inline: false },
        { name: 'Uptime', value: `${uptime}`, inline: false },
      );

    logger.debug(`[Ping Command] Ping calculated: ${botPing}ms, Uptime: ${uptime}`);

    await interaction.editReply({ content: `<@${interaction.user.id}>`, embeds: [embed] });
  },
};

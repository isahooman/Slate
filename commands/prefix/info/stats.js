const { logger } = require('../../../components/loggerUtil');
const moment = require('moment'); require('moment-duration-format');
const { EmbedBuilder } = require('discord.js');
const bot = require('../../../bot.js');
const { cpu, mem } = require('node-os-utils');

module.exports = {
  name: 'stats',
  usage: 'stats',
  category: 'info',
  aliases: [],
  nsfw: false,
  allowDM: true,
  description: 'Displays bot process statistics',
  execute(message) {
    // Get memory used by the process
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024 / 1024).toFixed(2);
    logger.debug(`[Stats Command] Memory usage: ${memoryUsage}GB`);

    // Get total system memory
    mem.info().then(info => {
      logger.debug(`[Stats Command] Memory info: ${info.totalMemMb}Mb`);
      const totalSysMem = (info.totalMemMb / 1024).toFixed(2);

      // Get CPU usage
      cpu.usage().then(cpuPercentage => {
        logger.debug(`[Stats Command] CPU usage: ${cpuPercentage.toFixed(2)}%`);

        const prefixCommandsCount = bot.client.prefixCommands.size;
        const slashCommandsCount = bot.client.slashCommands.size;
        const discordJSVersion = require('discord.js').version;
        const nodeJSVersion = process.version;
        const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');
        const threads = bot.client.threads.size;
        const textChannels = bot.client.channels.cache.filter(channel => channel.type === 'GUILD_TEXT').size;
        const voiceChannels = bot.client.channels.cache.filter(channel => channel.type === 'GUILD_VOICE').size;
        const servers = bot.client.guilds.cache.size;
        const users = bot.client.users.cache.size;

        // Build stats embed
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${bot.client.user.username} stats`, iconURL: bot.client.user.displayAvatarURL() })
          .setThumbnail(bot.client.user.displayAvatarURL())
          .addFields(
            { name: 'CPU Usage', value: `${cpuPercentage.toFixed(2)}%`, inline: true },
            { name: 'Memory usage', value: `${memoryUsage}GB/${totalSysMem}GB`, inline: true },
            { name: '‎', value: `‎`, inline: true },
            { name: 'Prefix Commands', value: `${prefixCommandsCount}`, inline: true },
            { name: 'Slash Commands', value: `${slashCommandsCount}`, inline: true },
            { name: '‎', value: `‎`, inline: true },
            { name: 'Threads', value: `${threads}`, inline: true },
            { name: 'Text Channels', value: `${textChannels}`, inline: true },
            { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
            { name: 'Servers', value: `${servers}`, inline: true },
            { name: 'Users', value: `${users}`, inline: true },
            { name: '‎', value: `‎`, inline: true },
            { name: `Discord.js v${discordJSVersion}`, value: `Nodejs ${nodeJSVersion}` },
          )
          .setFooter({ text: `Uptime: ${uptime}` });

        try {
          // Send the embed
          message.channel.send({ embeds: [embed] });
        } catch (error) {
          logger.error(`[Stats Command] Error sending stats embed: ${error.message}`);
        }
      });
    });
  },
};

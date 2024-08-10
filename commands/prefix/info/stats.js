const { logger } = require('../../../components/loggerUtil');
const moment = require('moment'); require('moment-duration-format');
const { EmbedBuilder } = require('discord.js');
const { client, cache } = require('../../../bot.js');
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

        const prefixCommandsCount = client.prefixCommands.size;
        const slashCommandsCount = client.slashCommands.size;
        const discordJSVersion = require('discord.js').version;
        const nodeJSVersion = process.version;
        const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');
        const threads = cache.threads.size;
        const channels = cache.channels.size;
        const servers = cache.guilds.size;
        const users = cache.members.size;

        // Build stats embed
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${client.user.username} stats`, iconURL: client.user.displayAvatarURL() })
          .setThumbnail(client.user.displayAvatarURL())
          .addFields(
            { name: 'CPU Usage', value: `${cpuPercentage.toFixed(2)}%`, inline: true },
            { name: 'Memory usage', value: `${memoryUsage}GB/${totalSysMem}GB`, inline: true },
            { name: '‎', value: `‎`, inline: true },
            { name: 'Prefix Commands', value: `${prefixCommandsCount}`, inline: true },
            { name: 'Slash Commands', value: `${slashCommandsCount}`, inline: true },
            { name: '‎', value: `‎`, inline: true },
            { name: 'Threads', value: `${threads}`, inline: true },
            { name: 'Channels', value: `${channels}`, inline: true },
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

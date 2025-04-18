const moment = require('moment'); require('moment-duration-format');
const { EmbedBuilder } = require('discord.js');
const { client, cache } = require('../../../bot.js');
const { cpu, mem } = require('node-os-utils');
const logger = require('../../../components/util/logger.js');

module.exports = {
  name: 'stats',
  usage: 'stats',
  category: 'info',
  allowDM: true,
  description: 'Displays bot process statistics',
  async execute(message) {
    logger.debug('[Stats Command] Starting stats command execution');
    const startTime = Date.now();

    // Usage stats
    logger.debug('[Stats Command] Fetching CPU usage');
    const cpuStartTime = Date.now();
    const cpuUsage = (await cpu.usage()).toFixed(2);
    logger.debug(`[Stats Command] CPU usage fetched: ${cpuUsage}% (Time taken: ${Date.now() - cpuStartTime}ms)`);

    logger.debug('[Stats Command] Fetching memory usage');
    const memoryStartTime = Date.now();
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024 / 1024).toFixed(2);
    logger.debug(`[Stats Command] Memory usage fetched: ${memoryUsage}GB (Time taken: ${Date.now() - memoryStartTime}ms)`);

    logger.debug('[Stats Command] Fetching total system memory');
    const totalSysMemStartTime = Date.now();
    const totalSysMem = ((await mem.info()).totalMemMb / 1024).toFixed(2);
    logger.debug(`[Stats Command] Total system memory fetched: ${totalSysMem}GB (Time taken: ${Date.now() - totalSysMemStartTime}ms)`);

    // Command counts
    logger.debug('[Stats Command] Fetching command counts');
    const commandCountsStartTime = Date.now();
    const prefixCommandsCount = client.prefixCommands.size;
    const slashCommandsCount = client.slashCommands.size;
    logger.debug(`[Stats Command] Command counts fetched: Prefix - ${prefixCommandsCount}, Slash - ${slashCommandsCount} (Time taken: ${Date.now() - commandCountsStartTime}ms)`);

    // Cache stats
    logger.debug('[Stats Command] Fetching cache stats');
    const cacheStatsStartTime = Date.now();
    const threads = cache.threads.size;
    const channels = cache.channels.size;
    const servers = cache.guilds.size;
    const users = cache.members.size;
    logger.debug(`[Stats Command] Cache stats fetched: Threads - ${threads}, Channels - ${channels}, Servers - ${servers}, Users - ${users} (Time taken: ${Date.now() - cacheStatsStartTime}ms)`);

    // Version info
    logger.debug('[Stats Command] Fetching version info');
    const versionInfoStartTime = Date.now();
    const discordJSVersion = require('discord.js').version;
    const nodeJSVersion = process.version;
    logger.debug(`[Stats Command] Version info fetched: Discord.js - ${discordJSVersion}, Node.js - ${nodeJSVersion} (Time taken: ${Date.now() - versionInfoStartTime}ms)`);

    // Uptime
    logger.debug('[Stats Command] Calculating uptime');
    const uptimeCalculationStartTime = Date.now();
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]');
    const botUptime = moment.duration(client.uptime, 'milliseconds').format('d[d] h[h] m[m] s[s]');
    logger.debug(`[Stats Command] Uptime calculated: Uptime - ${uptime}, Bot Uptime - ${botUptime} (Time taken: ${Date.now() - uptimeCalculationStartTime}ms)`);

    // Build stats embed
    logger.debug('[Stats Command] Creating embed');
    const embedCreationStartTime = Date.now();
    const embed = new EmbedBuilder()
      .setTitle('Bot Statistics')
      .addFields(
        { name: 'CPU Usage', value: `${cpuUsage}%`, inline: true },
        { name: 'Memory Usage', value: `${memoryUsage}GB/${totalSysMem}GB`, inline: true },
        { name: '‎', value: `‎`, inline: true },
        { name: 'Prefix Commands', value: `${prefixCommandsCount}`, inline: true },
        { name: 'Slash Commands', value: `${slashCommandsCount}`, inline: true },
        { name: '‎', value: `‎`, inline: true },
        { name: 'Channels', value: `${channels}`, inline: true },
        { name: 'Threads', value: `${threads}`, inline: true },
        { name: 'Servers', value: `${servers}`, inline: true },
        { name: 'Users', value: `${users}`, inline: false },
        { name: `Discord.js ${discordJSVersion}`, value: `NodeJS ${nodeJSVersion}`, inline: true },
      )
      .setFooter({ text: `Bot uptime: ${uptime}\nConnection uptime: ${botUptime}` });
    logger.debug(`[Stats Command] Embed created (Time taken: ${Date.now() - embedCreationStartTime}ms)`);

    logger.debug('[Stats Command] Sending message');
    const messageSendStartTime = Date.now();
    await message.channel.send({ embeds: [embed] });
    logger.debug(`[Stats Command] Message sent (Time taken: ${Date.now() - messageSendStartTime}ms)`);

    logger.debug(`[Stats Command] Stats command execution completed (Total time taken: ${Date.now() - startTime}ms)`);
  },
};

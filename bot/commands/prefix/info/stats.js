const { EmbedBuilder } = require('discord.js');
const { formatDuration } = require('#components/util/time.js');
const { client, cache } = require('#bot');
const os = require('node:os');
const logger = require('#components/util/logger.js');

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
    const cpuUsage = await new Promise(resolve => {
      const sample1 = os.cpus();
      setTimeout(() => {
        const sample2 = os.cpus();
        let idle = 0, total = 0;
        for (let i = 0; i < sample1.length; i++) {
          for (const type of ['user', 'nice', 'sys', 'idle', 'irq']) total += sample2[i].times[type] - sample1[i].times[type];

          idle += sample2[i].times.idle - sample1[i].times.idle;
        }
        resolve(((1 - idle / total) * 100).toFixed(2));
      }, 100);
    });
    logger.debug(`[Stats Command] CPU usage fetched: ${cpuUsage}% (Time taken: ${Date.now() - cpuStartTime}ms)`);

    logger.debug('[Stats Command] Fetching memory usage');
    const memoryStartTime = Date.now();
    const heapUsedBytes = process.memoryUsage().heapUsed;
    const heapUsedGB = heapUsedBytes / 1024 / 1024 / 1024;
    const memoryUsage = heapUsedGB >= 1 ?
      `${heapUsedGB.toFixed(2)}GB` :
      `${(heapUsedBytes / 1024 / 1024).toFixed(2)}MB`;
    logger.debug(`[Stats Command] Memory usage fetched: ${memoryUsage} (Time taken: ${Date.now() - memoryStartTime}ms)`);

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
    const uptime = formatDuration(Math.floor(process.uptime()));
    const botUptime = formatDuration(Math.floor(client.uptime / 1000));
    logger.debug(`[Stats Command] Uptime calculated: Uptime - ${uptime}, Bot Uptime - ${botUptime} (Time taken: ${Date.now() - uptimeCalculationStartTime}ms)`);

    // Build stats embed
    logger.debug('[Stats Command] Creating embed');
    const embedCreationStartTime = Date.now();
    const embed = new EmbedBuilder()
      .setTitle('Bot Statistics')
      .addFields(
        { name: 'CPU Usage', value: `${cpuUsage}%`, inline: true },
        { name: 'Memory Usage', value: memoryUsage, inline: true },
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

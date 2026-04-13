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

    // Usage stats
    let cpuUsage;
    try {
      cpuUsage = await new Promise(resolve => {
        const sample1 = os.cpus();
        if (!sample1 || sample1.length === 0) return resolve('N/A');
        setTimeout(() => {
          const sample2 = os.cpus();
          let idle = 0, total = 0;
          for (let i = 0; i < sample1.length; i++) {
            for (const type of ['user', 'nice', 'sys', 'idle', 'irq']) total += sample2[i].times[type] - sample1[i].times[type];

            idle += sample2[i].times.idle - sample1[i].times.idle;
          }
          resolve(total === 0 ? 'N/A' : ((1 - idle / total) * 100).toFixed(2));
        }, 100);
      });
    } catch {
      cpuUsage = 'N/A';
    }

    const heapUsedBytes = process.memoryUsage().heapUsed;
    const heapUsedGB = heapUsedBytes / 1024 / 1024 / 1024;
    const memoryUsage = heapUsedGB >= 1 ?
      `${heapUsedGB.toFixed(2)}GB` :
      `${(heapUsedBytes / 1024 / 1024).toFixed(2)}MB`;

    // Command counts
    const prefixCommandsCount = client.prefixCommands.size;
    const slashCommandsCount = client.slashCommands.size;

    // Cache stats
    const threads = cache.threads.size;
    const channels = cache.channels.size;
    const servers = cache.guilds.size;
    const users = cache.members.size;

    // Version info
    const discordJSVersion = require('discord.js').version;
    const nodeJSVersion = process.version;

    // Uptime
    const uptime = formatDuration(Math.floor(process.uptime()));
    const botUptime = formatDuration(Math.floor(client.uptime / 1000));

    // Build stats embed
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

    await message.channel.send({ embeds: [embed] });

    logger.debug('[Stats Command] Stats command execution completed');
  },
};

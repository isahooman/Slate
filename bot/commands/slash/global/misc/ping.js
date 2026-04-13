const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const logger = require('#components/util/logger.js');
const { formatDuration } = require('#components/util/time.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping') // Command name
    .setDescription('Check the bot\'s response time.') // Brief description of what the command does
    .setNSFW(false), // Age-Restrict this command allowing it to only be used in age-restricted channels
  category: 'misc', // Command category
  userInstall: true, // If the command will be included in user-installed commands
  cooldowns: { // Cooldown settings for the command
    user: 5000, // Per-user cooldown in milliseconds
    guild: null, // Per-server cooldown in milliseconds
    global: null, // Global cooldown in milliseconds
  },
  async execute(interaction) {
    const startTime = Date.now(); // Record start time
    logger.debug(`[Ping Command] Start time recorded: ${startTime}`);
    const uptime = formatDuration(Math.floor(process.uptime())); // Get uptime from the node process
    logger.debug(`[Ping Command] Uptime calculated: ${uptime}`);
    const botPing = interaction.client.ws.ping; // Get response time from the client
    logger.debug(`[Ping Command] Websocket ping retrieved: ${botPing}ms`);

    await interaction.reply('Pinging...'); // initial message to acknowledge the command
    logger.debug(`[Ping Command] Initial message sent: 'Pinging...'`);

    let embedColor;
    if (botPing < 60) embedColor = '#00ff37'; // Green for excellent connection
    else if (botPing < 100) embedColor = '#FFC107'; // Yellow for ok connection
    else embedColor = '#F44336'; // Red for poor connection

    const embed = new EmbedBuilder()
      .setColor(embedColor) // Set the color of the embed based on ping
      .setTitle('Pong!') // Set the title of the embed
      .addFields(
        { name: 'Response time', value: `${Date.now() - startTime}ms`, inline: false }, // Add a field for the response delay
        { name: 'Websocket Ping', value: `${botPing}ms`, inline: false }, // Add a field for the websocket ping
        { name: 'Uptime', value: `${uptime}`, inline: false }, // Add a field for the uptime
      );
    logger.debug(`[Ping Command] Embed created.`);

    logger.debug(`[Ping Command] Ping calculated: ${botPing}ms, Uptime: ${uptime}`);

    // Edit the initial message with the embed and mention
    await interaction.editReply({ content: `<@${interaction.user.id}>`, embeds: [embed] });
    logger.debug(`[Ping Command] Initial message edited with embed and mention`);
  },
};

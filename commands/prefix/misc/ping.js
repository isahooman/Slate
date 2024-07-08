const moment = require('moment');
require('moment-duration-format');
const logger = require('../../../components/logger.js');
const { EmbedBuilder } = require('discord.js'); // Import EmbedBuilder

module.exports = {
  name: 'ping', // Command name
  usage: 'ping', // example of how the command should be used by the user
  category: 'misc', // Category of the command
  aliases: ['p'], // Aliases provide alternate names for the command.
  nsfw: false, // Mark command as nsfw, this allows the command to only be used in age-restricted channel
  allowDM: false, // If the command is allowed to be used in direct messages or not
  description: 'Check the bot\'s response time.', // Brief description of what the command does
  execute(message) {
    // Log the start of the command
    logger.debug(`[Ping Command] Starting ping, calculation for user: ${message.author.username}`);

    const startTime = Date.now(); // Record start time
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]'); // Get uptime from the node process
    const botPing = message.client.ws.ping; // Get response time from the client

    message.channel.send('Pinging...') // Acknowledge the command
      .then(msg => {
        let embedColor;
        if (botPing < 75) embedColor = '#00ff37'; // Green for excellent connection
        else if (botPing < 150) embedColor = '#FFC107'; // Yellow for good connection
        else embedColor = '#F44336'; // Red for poor connection

        const embed = new EmbedBuilder() // Create a new EmbedBuilder
          .setColor(embedColor) // Set the color of the embed based on ping
          .setTitle('Pong!') // Set the title of the embed
          .addFields(
            { name: 'Response time', value: `${Date.now() - startTime}ms`, inline: false }, // Add a field for the response delay
            { name: 'Websocket Ping', value: `${botPing}ms`, inline: false }, // Add a field for the websocket ping
            { name: 'Uptime', value: `${uptime}`, inline: false }, // Add a field for the uptime
          );

        logger.debug(`[Ping Command] Ping calculated: ${botPing}ms, Uptime: ${uptime}`);

        msg.edit({ content: `<@${message.author.id}>`, embeds: [embed] }); // Edit the message with the embed and mention
      });
  },
};

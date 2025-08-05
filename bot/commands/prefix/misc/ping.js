const moment = require('moment'); require('moment-duration-format');
const logger = require('../../../components/util/logger.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping', // Command name
  usage: 'ping', // example of how the command should be used by the user
  category: 'misc', // Category of the command
  aliases: ['p'], // Aliases provide alternate names for the command.
  nsfw: false, // Mark command as non nsfw, this allows the command to be used in any channel.
  allowDM: true, // If the command is allowed to be used in direct messages or not
  description: 'Check the bot\'s response time.', // Brief description of what the command does
  execute(message) {
    const startTime = Date.now(); // Record start time
    logger.debug(`[Ping Command] Start time recorded: ${startTime}`);
    const uptime = moment.duration(process.uptime(), 'seconds').format('d[d] h[h] m[m] s[s]'); // Get uptime from the node process
    logger.debug(`[Ping Command] Uptime calculated: ${uptime}`);
    const botPing = message.client.ws.ping; // Get response time from the client
    logger.debug(`[Ping Command] Websocket ping retrieved: ${botPing}ms`);

    message.channel.send('Pinging...') // initial message to acknowledge the command
      .then(msg => {
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
        msg.edit({ content: `<@${message.author.id}>`, embeds: [embed] });
        logger.debug(`[Ping Command] Initial message edited with embed and mention`);
      });
  },
};

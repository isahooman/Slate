module.exports = {
  name: 'Leave',
  usage: 'Leave (-y to skip confirmation)',
  category: 'Owner',
  allowDM: false,
  description: 'Make the bot leave the current server',
  async execute(message) {
    if (message.content.includes('-y')) leaveServer();
    else try {
      // Ask for confirmation and wait for response
      await message.reply('Are you sure you want to make the bot leave this server? (y/n)');

      // Wait 15 seconds for response
      const filter = response => response.author.id === message.author.id && ['y', 'n'].includes(response.content.toLowerCase());
      const response = await message.channel.awaitMessages({ filter, max: 1, time: 15000 });

      // Leave the server if the response is 'y'
      if (response.first()?.content.toLowerCase() === 'y') leaveServer();
      // cancel if else
      else message.reply('Leaving cancelled.');
    } catch {
      message.reply('No response received. Leaving cancelled.');
    }

    /**
     * Leave the server
     * @author isahooman
     */
    function leaveServer() {
      // confirmation reply
      message.reply('Leaving...').then(() => {
        // leave
        message.guild.leave().catch(error => {
          throw new Error(`Error leaving server: ${error.message}`);
        });
      });
    }
  },
};

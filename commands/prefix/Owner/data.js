const { EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'data',
  usage: 'data',
  category: 'Owner',
  description: 'Display information about all prefix commands.',
  execute(message) {
    const commandsPath = path.join(__dirname, '..');
    const commandFolders = fs.readdirSync(commandsPath);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Command Information')
      .setDescription('Prefix command data.');

    // Loop through each folder in the command directory
    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

      let commandInfo = '';
      // Loop through each command file
      for (const file of commandFiles) {
        const commandPath = path.join(folderPath, file);
        const command = require(commandPath);
        commandInfo += `**${command.name}**\nUsage: ${command.usage}\nDescription: ${command.description}\n\n`;
      }
      if (commandInfo) embed.addFields({ name: folder, value: commandInfo, inline: false });
    }
    message.channel.send({ embeds: [embed] });
  },
};

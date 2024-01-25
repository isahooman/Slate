const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

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
      .setDescription('Here is the information about all prefix commands.');

    for (const folder of commandFolders) {
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

      let commandInfo = '';
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

const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../logger');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to reload.')
                .setRequired(false)),
    async execute(interaction) {
        const commandName = interaction.options.getString('command', false);

        if (!commandName) {
            // Reload all commands
            const commandDirectories = ['dev', 'global'];
            for (const directory of commandDirectories) {
                const commandFiles = fs.readdirSync(path.join(__dirname, '..', directory)).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const command = require(`../${directory}/${file}`);
                    delete require.cache[require.resolve(`../${directory}/${file}`)];
                    interaction.client.commands.set(command.data.name, command);
                }
            }
            await interaction.reply('All commands have been reloaded!');
        } else {
            // Reload a specific command
            const command = interaction.client.commands.get(commandName.toLowerCase());

            if (!command) {
                return interaction.reply(`There is no command with name \`${commandName}\`!`);
            }

            const directory = command.category === 'dev' ? 'dev' : 'global';
            const filePath = path.join(__dirname, '..', directory, `${command.data.name}.js`);
            delete require.cache[require.resolve(filePath)];

            try {
                interaction.client.commands.delete(command.data.name);
                const newCommand = require(filePath);
                interaction.client.commands.set(newCommand.data.name, newCommand);
                await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
            } catch (error) {
                logger.error(error);
                await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
            }
        }
    },
};
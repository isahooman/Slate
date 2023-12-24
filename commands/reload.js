const { SlashCommandBuilder } = require('discord.js');

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
            const commands = interaction.client.commands.map(command => command.data.name);
            for (const command of commands) {
                delete require.cache[require.resolve(`./${command}.js`)];
                const newCommand = require(`./${command}.js`);
                interaction.client.commands.set(newCommand.data.name, newCommand);
            }
            await interaction.reply('All commands have been reloaded!');
        } else {
            // Reload a specific command
            const command = interaction.client.commands.get(commandName.toLowerCase());

            if (!command) {
                return interaction.reply(`There is no command with name \`${commandName}\`!`);
            }

            delete require.cache[require.resolve(`./${command.data.name}.js`)];

            try {
                interaction.client.commands.delete(command.data.name);
                const newCommand = require(`./${command.data.name}.js`);
                interaction.client.commands.set(newCommand.data.name, newCommand);
                await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
            } catch (error) {
                console.error(error);
                await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
            }
        }
    },
};
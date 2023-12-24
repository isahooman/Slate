const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../logger');
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
            const commandTypes = ['prefix', 'slash'];
            for (const type of commandTypes) {
                const commandFiles = fs.readdirSync(path.join(__dirname, '../../', type)).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    try {
                        const filePath = path.join(__dirname, '../../', type, file);
                        delete require.cache[require.resolve(filePath)];
                        const newCommand = require(filePath);

                        if (type === 'prefix') {
                            interaction.client.prefixCommands.set(newCommand.name, newCommand);
                        } else { // Assume 'slash'
                            interaction.client.slashCommands.set(newCommand.data.name, newCommand);
                        }
                    } catch (error) {
                        logger.error(`Failed to reload ${type} command at ${file}: ${error.message}`);
                    }
                }
            }
            await interaction.reply('All commands have been reloaded!');
        } else {
            // Reload a specific command
            const isPrefixCommand = interaction.client.prefixCommands.has(commandName);
            const directory = isPrefixCommand ? 'prefix' : 'slash';
            const category = isPrefixCommand ? '' : (interaction.client.slashCommands.get(commandName)?.category || 'global');
            const filePath = path.join(__dirname, '../../', directory, category, `${commandName}.js`);

            try {
                delete require.cache[require.resolve(filePath)];
                const newCommand = require(filePath);

                if (isPrefixCommand) {
                    interaction.client.prefixCommands.set(newCommand.name, newCommand);
                } else {
                    interaction.client.slashCommands.set(newCommand.data.name, newCommand);
                }

                await interaction.reply(`Command \`${newCommand.name || newCommand.data.name}\` was reloaded!`);
            } catch (error) {
                logger.error(error);
                await interaction.reply(`There was an error while reloading the command \`${commandName}\`:\n\`${error.message}\``);
            }
        }
    },
};
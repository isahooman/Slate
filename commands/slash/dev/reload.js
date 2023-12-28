const { SlashCommandBuilder } = require('discord.js');
const logger = require('../../../logger');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads all commands')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of command to reload')
                .setRequired(true)
                .addChoices(
                    { name: 'slash', value: 'slash' },
                    { name: 'prefix', value: 'prefix' },
                )),

    async execute(interaction, client) {
        // Get type to reload from "type" option
        const commandType = interaction.options.getString('type');

        try {
            if (commandType === 'slash') {
                await reloadAllCommands(client.slashCommands, path.join(__dirname, '../../slash'), interaction, 'slash');
            } else if (commandType === 'prefix') {
                await reloadAllCommands(client.prefixCommands, path.join(__dirname, '../../prefix'), interaction, 'prefix');
            }

            logger.info('Commands reloaded successfully.');
        } catch (error) {
            logger.error(`Error reloading commands: ${error}`);
            await interaction.reply({ content: 'There was an error while reloading commands.', ephemeral: true });
        }
    },
};

async function reloadAllCommands(commandsCollection, directory, interaction, type) {
    // Clear the existing commands
    commandsCollection.clear();
    // Read commands from directory for specified type
    const commandFiles = readCommands(directory);

    // Loop through each command file and reload it
    for (const file of commandFiles) {
        delete require.cache[require.resolve(`${directory}/${file}`)];
        const command = require(`${directory}/${file}`);
        commandsCollection.set(type === 'slash' ? command.data.name : command.name, command);
    }

    await interaction.reply(`All ${type} commands reloaded successfully.`);
}

// Read the command files
function readCommands(directory) {
    const fs = require('fs');
    return fs.readdirSync(directory).filter(file => file.endsWith('.js'));
}

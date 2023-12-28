const { SlashCommandBuilder } = require('@discordjs/builders');
const path = require('path');
const logger = require('../../../logger');

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
                ))
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The specific command to reload')
                .setRequired(false)),

    async execute(interaction, client) {
        const commandType = interaction.options.getString('type');
        const commandName = interaction.options.getString('command');

        try {
            if (commandType === 'slash') {
                if (commandName) {
                    // Reload specific slash command
                    await reloadSpecificCommand(client.slashCommands, path.join(__dirname, '../../slash'), commandName, interaction, 'slash');
                } else {
                    // Reload all slash commands
                    await reloadAllCommands(client.slashCommands, client.readCommands, path.join(__dirname, '../../slash'), interaction, 'slash');
                }
            } else if (commandType === 'prefix') {
                if (commandName) {
                    // Reload specific prefix command
                    await reloadSpecificCommand(client.prefixCommands, path.join(__dirname, '../../prefix'), commandName, interaction, 'prefix');
                } else {
                    // Reload all prefix commands
                    await reloadAllCommands(client.prefixCommands, client.readCommands, path.join(__dirname, '../../prefix'), interaction, 'prefix');
                }
            }

            logger.info('Commands reloaded successfully.');
        } catch (error) {
            logger.error(`Error reloading commands: ${error}`);
            await interaction.reply({ content: 'There was an error while reloading commands.', ephemeral: true });
        }
    },
};

async function reloadAllCommands(commandsCollection, readCommandsFunction, directory, interaction, type) {
    commandsCollection.clear();
    const commandFiles = readCommandsFunction(directory);

    for (const fileData of commandFiles) {
        delete require.cache[require.resolve(fileData.path)];
        const command = require(fileData.path);
        commandsCollection.set(type === 'slash' ? command.data.name : command.name, command);
    }

    await interaction.reply(`All ${type} commands reloaded successfully.`);
}

async function reloadSpecificCommand(commandsCollection, directory, commandName, interaction, type) {
    const commandFiles = client.readCommands(directory);
    const fileData = commandFiles.find(f => (type === 'slash' ? require(f.path).data.name : require(f.path).name) === commandName);

    if (!fileData) {
        await interaction.reply({ content: `Command '${commandName}' not found.`, ephemeral: true });
        return;
    }

    delete require.cache[require.resolve(fileData.path)];
    const command = require(fileData.path);
    commandsCollection.set(type === 'slash' ? command.data.name : command.name, command);

    await interaction.reply(`Command '${commandName}' reloaded successfully.`);
}

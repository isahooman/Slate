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
            let filePath = findCommandFilePath(commandName, ['prefix', 'slash'], interaction.client);
            if (!filePath) {
                return await interaction.reply(`Command \`${commandName}\` not found.`);
            }
    
            try {
                delete require.cache[require.resolve(filePath)];
                const newCommand = require(filePath);
    
                if (newCommand.data) {
                    interaction.client.slashCommands.set(newCommand.data.name, newCommand);
                } else {
                    interaction.client.prefixCommands.set(newCommand.name, newCommand);
                }
    
                await interaction.reply(`Command \`${commandName}\` was reloaded!`);
            } catch (error) {
                logger.error(`Error reloading command '${commandName}': ${error.message}`);
                await interaction.reply(`There was an error while reloading the command \`${commandName}\`:\n\`${error.message}\``);
            }
        }
    },    
};
function findCommandFilePath(commandName, client) {
    const globalDir = path.join(__dirname, '../../../slash/global');
    const devDir = path.join(__dirname, '../../../slash/dev');

    let filePath = path.join(globalDir, `${commandName}.js`);
    logger.debug(`Checking for global command file at: ${filePath}`);
    if (fs.existsSync(filePath)) {
        logger.debug(`Global command file found: ${filePath}`);
        return filePath;
    }

    filePath = path.join(devDir, `${commandName}.js`);
    logger.debug(`Checking for dev command file at: ${filePath}`);
    if (fs.existsSync(filePath)) {
        logger.debug(`Dev command file found: ${filePath}`);
        return filePath;
    }

    logger.debug(`Command file not found for command: ${commandName}`);
    return null;
}

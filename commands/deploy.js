const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('../config.json');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Registers all slash commands in the guild.')
        .setDefaultPermission(false),
    async execute(interaction) {
        const rest = new REST({ version: '9' }).setToken(token);
        const commands = [];

        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./${file}`);
            commands.push(command.data.toJSON());
        }

        // Register the slash commands
        try {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );

            //send confirmation message
            await interaction.channel.send('All slash commands have been registered!');
        } catch (error) {
            console.error(error);
            await interaction.reply('Something went wrong while registering the slash commands.');
        }
    }
};
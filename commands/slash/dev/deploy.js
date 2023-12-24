const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token } = require('../../../config.json');
const logger = require('../../../logger');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Deploys global and guild-specific commands'),

    async execute(interaction) {
        // Log the start of the deployment
        logger.debug(`Starting to deploy commands`, interaction.client, 'slash', { interaction });

        const globalCommands = [];
        const guildCommands = [];
        const globalCommandFiles = fs.readdirSync('./commands/slash/global').filter(file => file.endsWith('.js'));
        const guildCommandFiles = fs.readdirSync('./commands/slash/dev').filter(file => file.endsWith('.js'));

        for (const file of globalCommandFiles) {
            const command = require(`../../../commands/slash/global/${file}`);
            globalCommands.push(command.data.toJSON());
            // Log global commands being deployed
            logger.debug(`Preparing global command: ${file}`, interaction.client, 'slash', { interaction });
        }

        for (const file of guildCommandFiles) {
            const command = require(`../../../commands/slash/dev/${file}`);
            guildCommands.push(command.data.toJSON());
            // Log dev commands deing deployed
            logger.debug(`Preparing dev command: ${file}`, interaction.client, 'slash', { interaction });
        }

        const rest = new REST({ version: '10' }).setToken(token);

        try {
            // Deploy global commands
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: globalCommands },
            );
            logger.info('Registered global slash commands!');

            // Deploy dev commands
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: guildCommands },
            );
            logger.info(`Registered guild slash commands for guildId: ${guildId}`);

            await interaction.reply('Slash commands deployed successfully!');
        } catch (error) {
            logger.error(`Deployment error: ${error}`);
            await interaction.reply('Failed to deploy slash commands.');
        }
    },
};

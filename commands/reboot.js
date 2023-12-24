const { SlashCommandBuilder } = require('@discordjs/builders');
const { token, ownerId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reboot')
        .setDescription('Restarts the bot.'),
    async execute(interaction) {
        // Check if the user is the owner
        if (interaction.user.id !== ownerId) {
            return await interaction.reply('You do not have permission to use this command.');
        }

        // Reply with the restarting message
        await interaction.reply('Restarting...');

        // Destroy the client and log in again to restart the bot
        interaction.client.destroy();
        interaction.client.login(token);
    },
};
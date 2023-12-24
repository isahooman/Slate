const { SlashCommandBuilder } = require("discord.js");
const { spawn } = require("child_process");
const logger = require('../../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Restart the bot"),
    async execute(interaction) {
        await interaction.reply("Restarting bot...");

        // Spawns a new bot process
        const process = spawn(process.argv[0], process.argv.slice(1), {
            detached: true,
            stdio: "inherit"
        });

        process.on('error', (error) => {
            logger.error(`Failed to restart bot: ${error}`);
        });

        process.on('close', (code, signal) => {
            logger.info(`Bot process exited with code ${code} and signal ${signal}`);
            process.exit(0);
        });

        // Detaches new process to run by itself and kill the current
        process.unref();
        interaction.client.destroy();
        process.exit();
    }
};
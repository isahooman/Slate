const { SlashCommandBuilder } = require("discord.js");
const { spawn } = require("child_process");
const logger = require('../../../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("restart")
        .setDescription("Restart the bot"),
    async execute(interaction) {
        logger.debug(`'restart' command invoked by ${interaction.user.tag}`, interaction.client, 'slash', { interaction });
        await interaction.reply("Restarting bot...");

        // Spawns a new bot process
        logger.debug('Restarting bot process', interaction.client, 'slash', { interaction });
        const childProcess = spawn(process.argv[0], process.argv.slice(1), {
            detached: true,
            stdio: "inherit"
        });

        childProcess.on('error', (error) => {
            logger.error(`Failed to restart bot: ${error}`);
        });

        childProcess.on('close', (code, signal) => {
            logger.info(`Bot process exited with code ${code} and signal ${signal}`);
            process.exit(0);
        });

        // Detaches the new process to run by itself and kills the current process
        childProcess.unref();
        interaction.client.destroy();
        process.exit();
    }
};

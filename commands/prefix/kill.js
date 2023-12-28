const { ownerId } = require('../../config.json');
const logger = require('../../logger.js');

module.exports = {
    name: 'kill',
    description: 'Terminates the bot',

    async execute(message) {
        // Check if the user is bot owner
        if (message.author.id !== ownerId) {
            // Ignore if the user is not owner
            return;
        }

        try {
            // Wait while sending confirmation message
            await message.channel.send('Shutting down...');

            // Logout of Discord
            message.client.destroy();

            // Kill the process
            process.exit();
        } catch (error) {
            logger.error('Error occurred while shutting down:', error);
        }
    },
};

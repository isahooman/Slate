const { AttachmentBuilder } = require('discord.js');
const logger = require('#components/util/logger.js');
const archiver = require('archiver');
const fetch = import('node-fetch');

module.exports = {
  name: 'emojis',
  usage: 'emojis',
  category: 'Utility',
  allowDM: false,
  description: 'Send all emojis from the current server in a zip file',
  async execute(message) {
    // Check if the server has emojis
    const emojis = message.guild.emojis.cache;
    if (!emojis.size) return message.channel.send('This server has no emojis.');

    try {
      // Create a zip archive
      const archiveBuffer = await new Promise((resolve, reject) => {
        const archive = archiver('zip');
        const buffer = [];
        archive
          .on('end', () => resolve(Buffer.concat(buffer)))
          .on('error', reject)
          .on('data', chunk => {
            buffer.push(chunk);
          });

        (async() => {
          // Download each emoji
          for (const emoji of emojis.values()) try {
            const response = await (await fetch).default(emoji.imageURL());
            if (!response.ok) {
              logger.warn(`Failed to download emoji ${emoji.name}: ${response.status} ${response.statusText}`);
              continue;
            }
            // Add the downloaded emoji into the archive
            archive.append(response.body, { name: `${emoji.animated ? 'animated' : 'static'}/${emoji.name}.${emoji.animated ? 'gif' : 'png'}` });
          } catch (error) {
            reject(new Error(`[Emojis Command] Error downloading emoji ${emoji.name}: ${error.message || error}`));
            return;
          }

          archive.finalize();
        })().catch(reject);
      });

      // Send the zip file
      const attachment = new AttachmentBuilder(archiveBuffer, { name: `${message.guild.name}_emojis.zip` });
      await message.channel.send({ files: [attachment] });
      logger.info(`[Emojis Command] Emojis sent successfully for server: ${message.guild.name}`);
    } catch (error) {
      throw new Error(`[Emojis Command] Error processing emojis: ${error.message || error}`);
    }
  },
};

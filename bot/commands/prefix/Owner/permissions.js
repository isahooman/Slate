const logger = require('../../../components/util/logger.js');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'permissions',
  usage: 'permissions',
  category: 'Owner',
  aliases: ['perms'],
  allowDM: false,
  description: `Check the bot's permissions`,
  async execute(message) {
    try {
      // Get the bot's nickname
      const botName = message.guild.members.me.nickname || message.client.user.username;
      // Get bot's permissions
      const botPermissions = message.guild.members.me.permissions;

      // Create the home page embed
      const homeEmbed = new EmbedBuilder()
        .setDescription('Please select a category from the menu below:')
        .setAuthor({
          name: `${botName} permissions`,
          iconURL: message.client.user.displayAvatarURL(),
        })
        .addFields({
          name: '‎',
          value: `Administrator: ${botPermissions.has('Administrator') ? '✅' : '❌'}`,
        });

      // Create the select menu
      const row = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('permissionsMenu')
            .setPlaceholder('Select a category')
            .addOptions(
              { label: 'General', value: 'general' },
              { label: 'Membership', value: 'membership' },
              { label: 'Text Channel', value: 'text_channel' },
              { label: 'Voice Channel', value: 'voice_channel' },
              { label: 'Apps', value: 'apps' },
            ),
        );

      // Send the home embed and menu
      await message.reply({ embeds: [homeEmbed], components: [row] });

      logger.debug('[Permissions Command] Permissions menu sent successfully.');
    } catch (error) {
      throw new Error(`[Permissions Command] Error: ${error.message}`);
    }
  },
};

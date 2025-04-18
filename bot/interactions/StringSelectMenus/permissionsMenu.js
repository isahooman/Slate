const { EmbedBuilder } = require('discord.js');

module.exports = {
  async stringSelectMenu(interaction, client) {
    try {
      // Get the bot's nickname
      const botName = interaction.guild.members.me.nickname || client.user.username;
      // Get the selected category
      const selectedCategory = interaction.values[0];
      // Get bot's permissions
      const botPermissions = interaction.guild.members.me.permissionsIn(interaction.channel);

      // Create the embed based on the selected category
      const createCategoryEmbed = category => {
        let embed = new EmbedBuilder()
          .setAuthor({
            name: `${botName} permissions`,
            iconURL: client.user.displayAvatarURL(),
          });

        // General category
        if (category === 'general') embed
          .setTitle('__General Permissions__')
          .addFields({
            name: '‎',
            value: `
                View Channels: ${botPermissions.has('ViewChannel') ? '✅' : '❌'}
                Manage Channels: ${botPermissions.has('ManageChannels') ? '✅' : '❌'}
                Manage Roles: ${botPermissions.has('ManageRoles') ? '✅' : '❌'}
                Create Expressions: ${botPermissions.has('CreatePublicThreads') ? '✅' : '❌'}
                Manage Expressions: ${botPermissions.has('ManageThreads') ? '✅' : '❌'}
                View Audit Log: ${botPermissions.has('ViewAuditLog') ? '✅' : '❌'}
                Manage Webhooks: ${botPermissions.has('ManageWebhooks') ? '✅' : '❌'}
                Manage Server: ${botPermissions.has('ManageGuild') ? '✅' : '❌'}
              `,
          });
        // Member category
        else if (category === 'membership') embed
          .setTitle('__Membership Permissions__')
          .addFields({
            name: '‎',
            value: `
                Create Invite: ${botPermissions.has('CreateInstantInvite') ? '✅' : '❌'}
                Change Nickname: ${botPermissions.has('ChangeNickname') ? '✅' : '❌'}
                Manage Nicknames: ${botPermissions.has('ManageNicknames') ? '✅' : '❌'}
                Kick Members: ${botPermissions.has('KickMembers') ? '✅' : '❌'}
                Ban Members: ${botPermissions.has('BanMembers') ? '✅' : '❌'}
                Timeout Members: ${botPermissions.has('ModerateMembers') ? '✅' : '❌'} 
              `,
          });
        // Text channel category
        else if (category === 'text_channel') embed
          .setTitle('__Text Channel Permissions__')
          .addFields({
            name: '‎',
            value: `
                Send Messages: ${botPermissions.has('SendMessages') ? '✅' : '❌'}
                Send Messages in Threads: ${botPermissions.has('SendMessagesInThreads') ? '✅' : '❌'}
                Create Public Threads: ${botPermissions.has('CreatePublicThreads') ? '✅' : '❌'}
                Create Private Threads: ${botPermissions.has('CreatePrivateThreads') ? '✅' : '❌'}
                Embed Links: ${botPermissions.has('EmbedLinks') ? '✅' : '❌'}
                Attach Files: ${botPermissions.has('AttachFiles') ? '✅' : '❌'}
                Add Reactions: ${botPermissions.has('AddReactions') ? '✅' : '❌'}
                Use External Emojis: ${botPermissions.has('UseExternalEmojis') ? '✅' : '❌'}
                Use External Stickers: ${botPermissions.has('UseExternalStickers') ? '✅' : '❌'}
                Mention All Roles: ${botPermissions.has('MentionEveryone') ? '✅' : '❌'}
                Manage Messages: ${botPermissions.has('ManageMessages') ? '✅' : '❌'}
                Manage Threads: ${botPermissions.has('ManageThreads') ? '✅' : '❌'}
                Read Message History: ${botPermissions.has('ReadMessageHistory') ? '✅' : '❌'}
                Send TTS Messages: ${botPermissions.has('SendTTSMessages') ? '✅' : '❌'}
                Send Voice Messages: ${botPermissions.has('Speak') ? '✅' : '❌'}
                Create Polls: ${botPermissions.has('CreatePoll') ? '✅' : '❌'} 
              `,
          });
        // Voice channel category
        else if (category === 'voice_channel') embed
          .setTitle('__Voice Channel Permissions__')
          .addFields({
            name: '‎',
            value: `
                Connect: ${botPermissions.has('Connect') ? '✅' : '❌'}
                Speak: ${botPermissions.has('Speak') ? '✅' : '❌'}
                Video: ${botPermissions.has('Stream') ? '✅' : '❌'}
                Use Soundboard: ${botPermissions.has('UseSoundboard') ? '✅' : '❌'} 
                Use External Sounds: ${botPermissions.has('UseExternalSounds') ? '✅' : '❌'}
                Use Voice Activity: ${botPermissions.has('UseVAD') ? '✅' : '❌'}
                Priority Speaker: ${botPermissions.has('PrioritySpeaker') ? '✅' : '❌'}
                Mute Members: ${botPermissions.has('MuteMembers') ? '✅' : '❌'}
                Deafen Members: ${botPermissions.has('DeafenMembers') ? '✅' : '❌'}
                Move Members: ${botPermissions.has('MoveMembers') ? '✅' : '❌'}
                Set Voice Channel Status: ${botPermissions.has('RequestToSpeak') ? '✅' : '❌'} 
              `,
          });
        // Apps category
        else if (category === 'apps') embed
          .setTitle('__Apps Permissions__')
          .addFields({
            name: '‎',
            value: `
                Use Application Commands: ${botPermissions.has('UseApplicationCommands') ? '✅' : '❌'}
                Use Activities: ${botPermissions.has('UseActivities') ? '✅' : '❌'} 
                Use External Apps: ${botPermissions.has('UseExternalApps') ? '✅' : '❌'} 
              `,
          });
        else embed.setTitle('__Category Not Implemented__');

        return embed;
      };

      const categoryEmbed = createCategoryEmbed(selectedCategory);

      // Update the message with the new embed
      await interaction.update({ embeds: [categoryEmbed] });
    } catch (error) {
      throw new Error(`[Permissions Command] Error handling stringSelectMenu interaction: ${error.message}`);
    }
  },
};

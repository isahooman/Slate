const logger = require('../../../components/util/logger');
const { EmbedBuilder } = require('discord.js');
const Search = require('../../../components/util/search');

const badges = {
  // Misc
  Staff: 'Discord Staff',
  Partner: 'Partnered Server Owner',
  CertifiedModerator: 'Moderator Program Alumni',
  PremiumEarlySupporter: 'Early Supporter',

  // HypeSquad badges
  Hypesquad: 'HypeSquad Events Member',
  HypeSquadOnlineHouse1: 'HypeSquad Bravery',
  HypeSquadOnlineHouse2: 'HypeSquad Brilliance',
  HypeSquadOnlineHouse3: 'HypeSquad Balance',

  // Bug Hunter badges
  BugHunterLevel1: 'Bug Hunter Level 1',
  BugHunterLevel2: 'Bug Hunter Level 2',

  // Developer badges
  VerifiedDeveloper: 'Early Verified Bot Developer',
  ActiveDeveloper: 'Active Developer',
  Collaborator: 'Collaborator',
  RestrictedCollaborator: 'Restricted Collaborator',

  // Bot badges
  VerifiedBot: 'Verified Bot',
  BotHTTPInteractions: 'Bot HTTP Interactions',

  // Account status badges
  Spammer: 'Spammer',
  Quarantined: 'Quarantined Account',
};

module.exports = {
  name: 'userinfo',
  usage: 'userinfo <user>',
  category: 'info',
  aliases: ['ui', 'whois'],
  allowDM: true,
  description: 'Shows information about the given user',

  async execute(message, args) {
    const userQuery = args.join(' ');
    logger.debug(`[UserInfo Command] User query: "${userQuery || 'None'}", from user: ${message.author.tag}`);

    try {
      // Find target user - default to message author if no query
      const search = new Search();
      const users = userQuery ? await search.member(message, userQuery) : [message.member];

      if (!users?.length) return message.channel.send({ content: 'Could not find any matching users.' });

      const foundUser = users[0];
      const userToFetch = foundUser.user || foundUser;

      logger.debug(`[UserInfo Command] Found: ${userToFetch.tag || userToFetch.username} (${userToFetch.id})`);

      const fetchedUser = await userToFetch.fetch(true);

      // Create and configure embed
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `User Information for ${fetchedUser.displayName || fetchedUser.username}`,
          iconURL: fetchedUser.displayAvatarURL({ extension: 'png', size: 512 }),
        })
        .setColor(message.member.roles?.color?.hexColor || 0x000001)
        .setThumbnail(fetchedUser.displayAvatarURL({ extension: 'png', size: 512 }))
        .addFields(
          { name: 'ID', value: fetchedUser.id },
          { name: 'Account created', value: fetchedUser.createdAt.toDateString(), inline: true },
          { name: 'Joined server', value: message.guild && foundUser.joinedAt ? foundUser.joinedAt.toDateString() : 'N/A', inline: true },
        );

      // Add roles if in a guild
      if (message.guild && foundUser.roles) {
        const rolesList = foundUser.roles.cache
          .filter(r => r.name !== '@everyone')
          .map(r => `<@&${r.id}> | ${r.hexColor !== '#000000' ? r.hexColor : 'No color'}`)
          .join('\n');

        embed.addFields({ name: 'Roles', value: rolesList || 'None' });
      }

      // Add user badges
      const flags = fetchedUser.flags.serialize();
      const flagString = Object.entries(flags)
        // eslint-disable-next-line no-unused-vars
        .filter(([_, value]) => value)
        .map(([flag]) => `- ${badges[flag] || flag}`)
        .join('\n');

      embed.addFields({
        name: 'Badges',
        value: flagString || 'This user has no badges!',
      });

      // Send the embed
      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      throw new Error(`[UserInfo Command] Error fetching user info: ${error.message}`);
    }
  },
};

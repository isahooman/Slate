const logger = require('../../../components/util/logger');
const { EmbedBuilder } = require('discord.js');
const Search = require('../../../components/util/search');

const badges = {
  Staff: 'Discord Staff',
  Partner: 'Partnered Server Owner',

  // Bug Hunter badges
  BugHunterLevel1: 'Bug Hunter Level 1',
  BugHunterLevel2: 'Bug Hunter Level 2',

  // HypeSquad Events badges
  Hypesquad: 'HypeSquad Events Member',
  HypeSquadOnlineHouse1: 'HypeSquad Bravery',
  HypeSquadOnlineHouse2: 'HypeSquad Brilliance',
  HypeSquadOnlineHouse3: 'HypeSquad Balance',

  // Flagged accounts
  Spammer: 'Spammer',
  Quarantined: 'Quarantined Account',

  // Dev badges
  ActiveDeveloper: 'Active Developer',
  VerifiedDeveloper: 'Early Verified Bot Developer',

  // Misc badges
  VerifiedBot: 'Verified Bot',
  PremiumEarlySupporter: 'Early Supporter',
  CertifiedModerator: 'Discord Certified Moderator',
};

module.exports = {
  name: 'userinfo',
  usage: 'userinfo <user>',
  category: 'info',
  aliases: ['ui'],
  nsfw: false,
  allowDM: true,
  description: 'Shows information the given user',

  async execute(message, args) {
    const userQuery = args.join(' ');
    logger.debug(`[UserInfo Command] User query: "${userQuery || 'None'}", from user: ${message.author.tag}`);

    const search = new Search();

    let users;
    if (!userQuery) {
      // If no query provided, default to the message author
      logger.debug('[UserInfo Command] No query provided, using message author');
      users = [message.member];
    } else {
      // Search for the user with the provided query
      users = await search.member(message, userQuery);
    }

    // Check if any users were found
    if (!users || users.length === 0 || !users[0]) {
      logger.debug('[UserInfo Command] No matching users found');
      return message.channel.send({ content: 'Could not find any matching users.' });
    }

    // Get the first matching user
    const foundUser = users[0];
    logger.debug(`[UserInfo Command] Found user: ${foundUser.user?.username || foundUser?.username || 'Unknown'} | ${foundUser.user?.id || foundUser?.id || 'Unknown ID'}`);

    // Validate the user object
    if (!foundUser || !(foundUser.user || foundUser.id)) {
      logger.error('[UserInfo Command] Invalid user object found');
      return message.channel.send({ content: 'There was an error fetching user information.' });
    }

    const userToFetch = foundUser.user || foundUser;

    logger.debug(`[UserInfo Command] Fetching user details for: ${userToFetch.tag} | ${userToFetch.id}`);

    userToFetch.fetch(true).then(fetchedUser => {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `User Information for ${fetchedUser.displayName || fetchedUser.username}`,
          iconURL: fetchedUser.displayAvatarURL({ extension: 'png', size: 512 }),
        })
        // Set embed color to the user's top role color
        .setColor(message.member.roles.color ? message.member.roles.color.hexColor : 0x000001)
        // Set user's avatar as the thumbnail
        .setThumbnail(fetchedUser.displayAvatarURL({ extension: 'png', size: 512 }))
        // Add basic user information fields
        .addFields(
          { name: 'ID', value: fetchedUser.id },
          { name: 'Account created', value: fetchedUser.createdAt.toDateString(), inline: true },
          { name: 'Joined server', value: message.guild ? foundUser.joinedAt?.toDateString() || 'N/A' : 'N/A', inline: true },
        );

      // Add roles information if in a guild
      if (message.guild && foundUser.roles) {
        logger.debug(`[UserInfo Command] Processing roles for guild: ${message.guild.name} | ${message.guild.id}`);

        // Format the roles, showing colors and ignoring @everyone
        const rolesList = foundUser.roles.cache
          .filter(r => r.name !== '@everyone')
          .map(r => `<@&${r.id}> | ${r.hexColor !== '#000000' ? r.hexColor : 'No color'}`)
          .join('\n');

        embed.addFields({
          name: 'Roles',
          value: rolesList || 'None',
          inline: false,
        });
      }

      // Add user badges
      logger.debug('[UserInfo Command] Processing user badges');
      let flags = fetchedUser.flags.serialize();
      let flagString = '';

      // Convert badges to public names
      for (const flag in flags) if (flags[flag]) {
        const badgeName = badges[flag] || flag;
        flagString += `- ${badgeName}\n`;
      }

      embed.addFields({
        name: 'Badges',
        value: flagString !== '' ? flagString : 'This user has no badges!',
        inline: false,
      });

      // Send the embed
      logger.debug('[UserInfo Command] Sending message with embed');
      message.channel.send({ embeds: [embed] })
        .catch(err => {
          logger.error(`[UserInfo Command] Error sending userinfo embed: ${err}`);
        });
    }).catch(err => {
      logger.error(`[UserInfo Command] Error fetching user: ${err}`);
      message.channel.send({ content: 'There was an error fetching user information.' });
    });
  },
};

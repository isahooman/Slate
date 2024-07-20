const { logger } = require('../../components/loggerUtil.js');

module.exports = {
  name: 'inviteDelete',
  execute(invite) {
    logger.info(`Invite deleted;
      Code: ${invite.code},
      Channel: ${invite.channel.name} | ${invite.channel.id},
      Inviter: ${invite.inviter ? invite.inviter.tag : 'N/A'},
      Max Uses: ${invite.maxUses || 'Unlimited'},
      Max Age: ${invite.maxAge || 'Unlimited'},
      Temporary: ${invite.temporary ? 'Yes' : 'No'},
      Deleted At: ${new Date().toISOString()}
    `);
  },
};

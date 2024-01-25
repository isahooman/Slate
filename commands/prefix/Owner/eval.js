const util = require('util');

module.exports = {
  name: 'eval',
  usage: 'eval <js code>',
  category: 'Owner',
  description: 'Evaluates JavaScript code.',
  async execute(message, args) {
    if (!args.length) return message.reply('Provide something to evaluate');

    try {
      const content = args.join(' ');
      let evaled = await eval(content);
      if (typeof evaled !== 'string') evaled = util.inspect(evaled);
      if (evaled.length > 1980) evaled = 'Output too long.';
      await message.channel.send({ content: `\`\`\`js\n${evaled}\n\`\`\`` });
    } catch (err) {
      console.error(err);
      message.channel.send({ content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\`` });
    }
    console.debug('Finished Evaluation');
  },
};

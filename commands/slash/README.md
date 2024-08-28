# Slash commands

## Usage

These commands are able to be used by combining the command name with the / prefix.
For example:
If the command name is ping you can type `/ping`

## Developing

### Example Slash Command

```js
// exampleCategoryFolder/exampleCommand.js
const { logger } = require('../../../components/loggerUtil.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('example') // Sets the command name. You cannot use capital letters and must only include text.
    .setDescription('This is an example description.') // Sets the command description
    .setNSFW(false) // Age-restricts the command.
    .setDMPermission(true), // Determines if the command can be used in DMs.
  category: 'misc', // Sets the command category.
  cooldowns: { // Optional cooldown parameter for each command
    user: 3000, // Milliseconds until the user of the command can use this command again
    guild: 0, // Milliseconds until the guild that used the command can use this command again
    global: 0, // Milliseconds until anyone can use the command again in the entirety of the bot
  },


  async execute(interaction, client) {
    // This shows a debug message of the command with your given input
    logger.debug('This is an example debugging message.');
    // Reply to user
    await interaction.reply(`This is a reply example message`);
  },
  // The following executions are on a per command basis and fully optional.
  executeButton(interaction, client) {
    await interaction.reply('This is an example reply message');
  },
  executeStringSelectMenu(interaction, client) {
    await interaction.reply('This is an example reply message');
  },
  executeModalSubmit(interaction, client) {
    await interaction.reply('This is an example reply message');
  }

};
```

### Slash Command Boilerplate

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('')
    .setDescription('')
    .setNSFW(Boolean)
    .setDMPermission(Boolean),
  category: '',
  cooldowns: {
    user: Number,
    guild: Number,
    global: Number,
  },

  execute(interaction, client) {

  },
  executeButton(interaction, client) {

  },
  executeStringSelectMenu(interaction, client) {

  },
  executeModalSubmit(interaction, client) {

  }
};
```

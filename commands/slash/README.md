# Slash commands

## Usage

These commands are able to be used by combining the command name with the / prefix.
For example:
If the command name is ping you can type `/ping`

## Developing

### Example Slash Command

```js
// exampleCategoryFolder/exampleCommand.js
const logger = require('../../../components/logger.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('This is an example description.'),

  async execute(interaction) {
        // This shows a debug message of the command with your given input
        logger.debug('This is an example debugging message.');
        // Reply to user
        await interaction.reply(`This is a reply example message`);
  },
};
```

### Slash Command Boilerplate

```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('')
    .setDescription(''),

  execute(interaction) {

  },
};
```

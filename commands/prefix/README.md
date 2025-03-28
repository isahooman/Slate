# Prefix commands

## Usage

These commands are able to be used by combining the command name with the prefix in `config.json5`.
For example:
If the prefix is `.` and the command name is `ping` then you can use the command by typing `.ping` into a channel that the bot can read.

## Developing

### Example Command

```js
// exampleCategoryFolder/exampleCommand.js
const logger = require("../../../components/util/logger.js");

module.exports = {
  name: "example", // Command name
  usage: "example", // Example of how the command should be used by the user
  category: "misc", // Category of the command
  aliases: ["ex"], // Aliases provide alternate names for the command.
  nsfw: false, // Mark command as nsfw, this allows the command to only be used in age-restricted channels
  allowDM: false, // Allows the command to be used in dms
  description: "This is an example description", // Brief description of what the command does
  cooldowns: {
    // Optional cooldown parameter for each command
    user: 3000, // Milliseconds until the user of the command can use this command again
    guild: 0, // Milliseconds until the guild that used the command can use this command again
    global: 0, // Milliseconds until anyone can use the command again in the entirety of the bot
  },
  execute(message) {
    // This shows a debug message of the command with your given input
    logger.debug("This is an example debugging message.");

    // Send a response
    // Option 1
    message.channel.send(`<@${message.author.id}> This is example text.`);
    // Option 2, This will create a reply to the user and ping them
    message.reply("This is example text");
    // Option 3, This ends the command file short.
    return message.channel.send({ content: "This is message content" });
    // Option 4, This will make it so only the command user can see this message
    return message.channel.send({
      content: "This is message content",
      ephemeral: true,
    });
  },
};
```

### Command Boilerplate

```js
module.exports = {
  name: "",
  usage: "",
  category: "",
  aliases: [""],
  nsfw: false,
  allowDM: false,
  description: "",
  execute(message) {},
};
```

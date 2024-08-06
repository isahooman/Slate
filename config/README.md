# Example Configurations

Table of Contents

- [Example Configurations](#example-configurations)
  - [blacklist.json](#blacklistjson)
  - [config.json5](#configjson5)
  - [events.json](#eventsjson)
  - [logging.json](#loggingjson)
  - [status.json](#statusjson)

## blacklist.json

[Back to top](#example-configurations)

```json
{
  "users": ["496360025099337727"],
  "servers": {
    "leave": ["496360025099337727"],
    "ignore": ["496360025099337727"]
  }
}
```

- `users`
  - Array of Strings: `["496360025099337727"]`
  - User IDs that are entered into here refer to users the bot will not allow to use commands.
- `servers`
  - Object: Contains two arrays, `leave` and `ignore`.
    - `leave`
      - Array of Strings: `["496360025099337727"]`
      - Server IDs that are entered into here refer to servers the bot will automatically leave upon joining.
    - `ignore`
      - Array of Strings: `["496360025099337727"]`
      - Server IDs that are entered into here refer to servers the bot will not allow to use commands.

## config.json5

[Back to top](#example-configurations)

```json5
{
  // Your discord bot token
  token: "MTA2MjkzMTk3MzU3NzkwNDEzOQ.GTX3J-.62b_6VJfJu6jNbOGNyAyqeJkvzRvo5YVpSbANY",

  // Your discord application client id
  clientId: "1032931173577814139",

  // Your id along with any other owners
  ownerId: ["496360025099337727", "932498572837456323"],

  // Your home server id
  guildId: "762498572837456323",

  // Prefix in which the bot will respond too
  prefix: "!",

  // whether or not slash commands will be redeployed when the bot starts
  deployOnStart: true,

  // whether or not the bot will send a message when it's online and ready
  notifyOnReady: true,
  // (optional) Channel within the home server which will receive ready notification
  readyChannel: ["1177831782468437121"],
  // (optional) Users who will receive ready notifications
  readyUsers: ["496360025099337728"],

  // whether or not the bot will attempt to send a report when an error occurs
  reportErrors: true,
  // (optional) Channel within the home server which the bot will send error reports to
  reportChannel: ["1177831782468437121"],
  // (optional) Users who will receive error reports in dms
  reportUsers: ["496360025099337728"],
}
```

- `token`
  - String: `"MTA2MjkzMTk3MzU3NzkwNDEzOQb_6VJfJu6jNbOGNyAyqeJkvzRvo5YVpSbANY"`
  - This refers to the bot token, or login information, of your bot. Do not share this with anyone.
- `clientId`
  - String: `"1032931173577814139"`
  - This refers to the user ID of your bot.
- `ownerId`
  - Array of Strings: `["496360025099337727", "932498572837456323"]`
  - Any user ID entered into this field will have owner permissions in the bot.
- `guildId`
  - String: `"762498572837456323"`
  - Any guild ID entered into this field will be considered your home or dev server.
- `prefix`
  - String: `"!"`
  - This refers to the prefix the bot will respond to when using commands.
- `deployOnStart`
  - Boolean: `true` or `false`
  - This refers to whether or not the bot should deploy commands upon starting
    <br><br>
- `notifyOnReady`
  - Boolean: `true` or `false`
  - This refers to whether or not the bot will send a message when it's online and ready
- `readyChannel`
  - Array of Strings: `["1177831782468437121"]`
  - This refers to the channel within the home server which will receive ready notification
- `readyUsers`
  - Array of Strings: `["496360025099337728"]`
  - This refers to the users who will receive ready notifications
    <br><br>
- `reportErrors`
  - Boolean: `true` or `false`
  - This refers to whether or not the bot will attempt to send a report when an error occurs
- `reportChannel`
  - Array of Strings: `["1177831782468437121"]`
  - This refers to the channel within the home server which the bot will send error reports to
- `reportUsers`
  - Array of Strings: `["496360025099337728"]`
  - This refers to the users who will receive error reports in dms

## events.json

[Back to top](#example-configurations)

```json
{
  "interactionCreate": true,
  "messageCreate": true,
  "messageUpdate": true,
  "ready": true,
  "warn": false,
  "error": false,

  "debug": false,

  "applicationCommandCreate": false,
  "applicationCommandDelete": false,
  "applicationCommandUpdate": false,

  "channelCreate": false,
  "channelDelete": false,
  "channelPinsUpdate": false,
  "channelUpdate": false,

  "emojiCreate": false,
  "emojiDelete": false,
  "emojiUpdate": false,

  "guildBanAdd": false,
  "guildBanRemove": false,
  "guildCreate": false,
  "guildDelete": false,
  "guildIntegrationsUpdate": false,
  "guildUnavailable": false,
  "guildUpdate": false,
  "guildAuditLogEntryCreate": false,
  "guildAvailable": false,

  "guildScheduledEventCreate": false,
  "guildScheduledEventDelete": false,
  "guildScheduledEventUpdate": false,
  "guildScheduledEventUserAdd": false,
  "guildScheduledEventUserRemove": false,

  "guildMemberAdd": false,
  "guildMemberAvailable": false,
  "guildMemberRemove": false,
  "guildMembersChunk": false,
  "guildMemberUpdate": false,

  "inviteCreate": false,
  "inviteDelete": false,

  "messageDelete": false,
  "messageDeleteBulk": false,
  "messageReactionAdd": false,
  "messageReactionRemove": false,
  "messageReactionRemoveAll": false,
  "messageReactionRemoveEmoji": false,

  "presenceUpdate": false,

  "roleCreate": false,
  "roleDelete": false,
  "roleUpdate": false,

  "shardDisconnect": true,
  "shardError": true,
  "shardReady": true,
  "shardReconnecting": true,
  "shardResume": true,

  "stageInstanceCreate": false,
  "stageInstanceDelete": false,
  "stageInstanceUpdate": false,

  "stickerCreate": false,
  "stickerDelete": false,
  "stickerUpdate": false,

  "threadCreate": false,
  "threadDelete": false,
  "threadListSync": false,
  "threadMembersUpdate": false,
  "threadMemberUpdate": false,
  "threadUpdate": false,

  "autoModerationActionExecution": false,
  "autoModerationRuleCreate": false,
  "autoModerationRuleDelete": false,
  "autoModerationRuleUpdate": false,

  "cacheSweep": false,

  "webhookUpdate": false,

  "rateLimit": false,

  "typingStart": false,

  "userUpdate": false,

  "voiceStateUpdate": false,

  "invalidated": false,

  "invalidRequestWarning": false,

  "applicationCommandPermissionsUpdate": false
}
```

- `interactionCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `interactionCreate` event.
- `messageCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `messageCreate` event.
- `messageUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `messageUpdate` event.
- `ready`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `ready` event.
- `warn`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `warn` event.
- `error`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `error` event.
- `debug`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `debug` event.
- `applicationCommandCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `applicationCommandCreate` event.
- `applicationCommandDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `applicationCommandDelete` event.
- `applicationCommandUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `applicationCommandUpdate` event.
- `channelCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `channelCreate` event.
- `channelDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `channelDelete` event.
- `channelPinsUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `channelPinsUpdate` event.
- `channelUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `channelUpdate` event.
- `emojiCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `emojiCreate` event.
- `emojiDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `emojiDelete` event.
- `emojiUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `emojiUpdate` event.
- `guildBanAdd`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildBanAdd` event.
- `guildBanRemove`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildBanRemove` event.
- `guildCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildCreate` event.
- `guildDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildDelete` event.
- `guildIntegrationsUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildIntegrationsUpdate` event.
- `guildUnavailable`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildUnavailable` event.
- `guildUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildUpdate` event.
- `guildAuditLogEntryCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildAuditLogEntryCreate` event.
- `guildAvailable`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildAvailable` event.
- `guildScheduledEventCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildScheduledEventCreate` event.
- `guildScheduledEventDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildScheduledEventDelete` event.
- `guildScheduledEventUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildScheduledEventUpdate` event.
- `guildScheduledEventUserAdd`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildScheduledEventUserAdd` event.
- `guildScheduledEventUserRemove`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildScheduledEventUserRemove` event.
- `guildMemberAdd`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildMemberAdd` event.
- `guildMemberAvailable`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildMemberAvailable` event.
- `guildMemberRemove`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildMemberRemove` event.
- `guildMembersChunk`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildMembersChunk` event.
- `guildMemberUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `guildMemberUpdate` event.
- `inviteCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `inviteCreate` event.
- `inviteDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `inviteDelete` event.
- `messageDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `messageDelete` event.
- `messageDeleteBulk`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `messageDeleteBulk` event.
- `messageReactionAdd`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `messageReactionAdd` event.
- `messageReactionRemove`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `messageReactionRemove` event.
- `messageReactionRemoveAll`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `messageReactionRemoveAll` event.
- `messageReactionRemoveEmoji`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `messageReactionRemoveEmoji` event.
- `presenceUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `presenceUpdate` event.
- `roleCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `roleCreate` event.
- `roleDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `roleDelete` event.
- `roleUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `roleUpdate` event.
- `shardDisconnect`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `shardDisconnect` event.
- `shardError`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `shardError` event.
- `shardReady`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `shardReady` event.
- `shardReconnecting`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `shardReconnecting` event.
- `shardResume`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `shardResume` event.
- `stageInstanceCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `stageInstanceCreate` event.
- `stageInstanceDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `stageInstanceDelete` event.
- `stageInstanceUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `stageInstanceUpdate` event.
- `stickerCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `stickerCreate` event.
- `stickerDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `stickerDelete` event.
- `stickerUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `stickerUpdate` event.
- `threadCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `threadCreate` event.
- `threadDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `threadDelete` event.
- `threadListSync`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `threadListSync` event.
- `threadMembersUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `threadMembersUpdate` event.
- `threadMemberUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `threadMemberUpdate` event.
- `threadUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `threadUpdate` event.
- `autoModerationActionExecution`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `autoModerationActionExecution` event.
- `autoModerationRuleCreate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `autoModerationRuleCreate` event.
- `autoModerationRuleDelete`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `autoModerationRuleDelete` event.
- `autoModerationRuleUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `autoModerationRuleUpdate` event.
- `cacheSweep`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `cacheSweep` event.
- `webhookUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `webhookUpdate` event.
- `rateLimit`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `rateLimit` event.
- `typingStart`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `typingStart` event.
- `userUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `userUpdate` event.
- `voiceStateUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `voiceStateUpdate` event.
- `invalidated`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `invalidated` event.
- `invalidRequestWarning`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `invalidRequestWarning` event.
- `applicationCommandPermissionsUpdate`
  - Boolean: `true` or `false`
  - If true, the bot will listen for the `applicationCommandPermissionsUpdate` event.

## intents.json

[Back to top](#example-configurations)

```json
{
  "Guilds": true,
  "GuildMembers": true,
  "GuildModeration": true,
  "GuildEmojisAndStickers": false,
  "GuildIntegrations": false,
  "GuildWebhooks": false,
  "GuildInvites": false,
  "GuildVoiceStates": false,
  "GuildPresences": false,
  "GuildMessages": true,
  "GuildMessageReactions": false,
  "GuildMessageTyping": false,

  "DirectMessages": false,
  "DirectMessageReactions": false,
  "DirectMessageTyping": false,

  "MessageContent": true,

  "GuildScheduledEvents": false,
  "AutoModerationConfiguration": false,
  "AutoModerationExecution": false
}
```

- `Guilds`
  - Boolean: `true` or `false`
  - If true, the bot will interact with guilds.
- `GuildMembers`
  - Boolean: `true` or `false`
  - If true, the bot will interact with guild members.
- `GuildModeration`
  - Boolean: `true` or `false`
  - If true, the bot will perform guild moderation.
- `GuildEmojisAndStickers`
  - Boolean: `true` or `false`
  - If true, the bot will use guild emojis and stickers.
- `GuildIntegrations`
  - Boolean: `true` or `false`
  - If true, the bot will use guild integrations.
- `GuildWebhooks`
  - Boolean: `true` or `false`
  - If true, the bot will use guild webhooks.
- `GuildInvites`
  - Boolean: `true` or `false`
  - If true, the bot will use guild invites.
- `GuildVoiceStates`
  - Boolean: `true` or `false`
  - If true, the bot will use guild voice states.
- `GuildPresences`
  - Boolean: `true` or `false`
  - If true, the bot will use guild presences.
- `GuildMessages`
  - Boolean: `true` or `false`
  - If true, the bot will interact with guild messages.
- `GuildMessageReactions`
  - Boolean: `true` or `false`
  - If true, the bot will interact with guild message reactions.
- `GuildMessageTyping`
  - Boolean: `true` or `false`
  - If true, the bot will interact with guild message typing.
- `DirectMessages`
  - Boolean: `true` or `false`
  - If true, the bot will interact with direct messages.
- `DirectMessageReactions`
  - Boolean: `true` or `false`
  - If true, the bot will interact with direct message reactions.
- `DirectMessageTyping`
  - Boolean: `true` or `false`
  - If true, the bot will interact with direct message typing.
- `MessageContent`
  - Boolean: `true` or `false`
  - If true, the bot will interact with message content.
- `GuildScheduledEvents`
  - Boolean: `true` or `false`
  - If true, the bot will interact with guild scheduled events.
- `AutoModerationConfiguration`
  - Boolean: `true` or `false`
  - If true, the bot will interact with guild auto-moderation configuration.
- `AutoModerationExecution`
  - Boolean: `true` or `false`
  - If true, the bot will interact with guild auto-moderation execution.

## logging.json

[Back to top](#example-configurations)

```json
{
  "INFO": true,
  "WARN": true,
  "ERROR": true,

  "DEBUG": true,

  "START": true,
  "LOADING": true,

  "COMMAND": true,
  "MESSAGE": true,
  "INTERACTION": true
}
```

- `INFO`
  - Boolean: `true` or `false`
  - If true, the bot will log informational messages.
- `WARN`
  - Boolean: `true` or `false`
  - If true, the bot will log warning messages.
- `ERROR`
  - Boolean: `true` or `false`
  - If true, the bot will log error messages.
- `DEBUG`
  - Boolean: `true` or `false`
  - If true, the bot will log debug messages.
- `START`
  - Boolean: `true` or `false`
  - If true, the bot will log start-up messages.
- `LOADING`
  - Boolean: `true` or `false`
  - If true, the bot will log loading messages.
- `COMMAND`
  - Boolean: `true` or `false`
  - If true, the bot will log command execution messages.
- `MESSAGE`
  - Boolean: `true` or `false`
  - If true, the bot will log message events.
- `INTERACTION`
  - Boolean: `true` or `false`
  - If true, the bot will log interaction events.

## status.json

```json
{
  "playing": ["with your friends", "with fire"],

  "streaming": ["PUBG", "Minecraft"],

  "listening": ["music", "keyboard tapping"],

  "watching": ["out for you", "Youtube"]
}
```

- `playing`
  - Array of Strings: Contains various activities the bot can display as its "Playing" status.
  - Examples: `"with your friends"`, `"with fire"`
- `streaming`
  - Array of Strings: Contains various activities the bot can display as its "Streaming" status.
  - Examples: `"PUBG"`, `"Minecraft"`
- `listening`
  - Array of Strings: Contains various activities the bot can display as its "Listening to" status.
  - Examples: `"music"`, `"keyboard tapping"`
- `watching`
  - Array of Strings: Contains various activities the bot can display as its "Watching" status.
  - Examples: `"out for you"`, `"Youtube"`

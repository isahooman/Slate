const { EmbedBuilder } = require('discord.js');
const configManager = require('../../../components/configManager');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const outputDir = path.join(__dirname, '..', '..', '..', 'output');
const errorDir = path.join(outputDir, 'err');

let _client;

// ============================================================
// Setup
// ============================================================

/**
 * Ensures error directory exists
 * @param {object} logger Logger instance
 * @author isahooman
 */
function ensureErrorDirectory(logger) {
  if (!fs.existsSync(errorDir)) {
    fs.mkdirSync(errorDir, { recursive: true });
    if (logger) logger.info(`Created error directory: [${errorDir}]`);
    else process.stdout.write(`Created error directory: [${errorDir}]`);
  }
}

/**
 * Gets the Discord client instance
 * @returns {object|null} Discord client if it exists and is ready
 * @author isahooman
 */
function getClient() {
  if (!_client) try {
    const bot = require('../../bot.js');
    _client = bot.client;
  } catch (err) {
    process.stderr.write(`Failed to load client: ${err.message}`);
    return null;
  }

  // Only return the client if it exists and is ready
  return _client?.isReady?.() === true ? _client : null;
}

// ==========================================================
// Message Queue
// ==========================================================

const queue = [];
const checkQueue = 3000;
const retryQueue = 500;
let queueInterval = null;

/**
 * Process the message queue.
 * Attempt to send messages if client is ready.
 * Auto-retries if client is not ready.
 * @param {object} logger Logger instance
 * @author isahooman
 */
async function processQueue(logger) {
  // If queue is empty use longer check interval
  if (queue.length === 0) {
    if (queueInterval) {
      clearInterval(queueInterval);
      queueInterval = setInterval(() => processQueue(logger), checkQueue);
    }
    return;
  }

  // If queue has messages use shorter retry interval
  if (!getClient()) {
    if (queueInterval) clearInterval(queueInterval);
    queueInterval = setInterval(() => processQueue(logger), retryQueue);
    process.stdout.write(`Client not ready yet, will retry sending ${queue.length} messages in ${retryQueue / 1000} seconds\n`);
    return;
  }

  if (logger) logger.debug(`Processing message queue, ${queue.length} messages pending\n`);
  else process.stdout.write(`Processing message queue, ${queue.length} messages pending\n`);

  // Clone and clear queue
  const currentQueue = [...queue];
  queue.length = 0;

  // Attempt to send each message in the queue
  for (const { messageContent, targetType, filePath, options, logger: msgLogger } of currentQueue) try {
    await sendMessage(messageContent, targetType, filePath, options, msgLogger || logger);
  } catch (err) {
    // If sending fails, add back to queue
    process.stderr.write(`Failed to send message: ${err.message}, returning to queue\n`);
    queue.push({ messageContent, targetType, filePath, options, logger: msgLogger || logger });
  }

  // Adjust interval based on queue state after processing
  if (queue.length > 0) {
    if (queueInterval) clearInterval(queueInterval);
    queueInterval = setInterval(() => processQueue(logger), retryQueue);
  } else {
    if (queueInterval) clearInterval(queueInterval);
    queueInterval = setInterval(() => processQueue(logger), checkQueue);
  }
}

/**
 * Starts the queue monitoring process
 * @param {object} logger Logger instance
 * @author isahooman
 */
function startQueueMonitor(logger) {
  if (!queueInterval) {
    queueInterval = setInterval(() => processQueue(logger), checkQueue);
    process.stdout.write('Queue monitor started\n');
  }
}

// ==========================================================
// Message Sending
// ==========================================================

/**
 * Sends a message to specified targets.
 * @param {object} messageContent - The message content.
 * @param {string} [targetType] - Message target type:
 *  - 'error': Sends to owner(s) and error users
 *  - 'ready': Sends to owner(s) and ready users
 *  - Otherwise, sends only to owner(s).
 * @param {string} [filePath] - The path to the file to send (optional).
 * @param {object} [options] - Additional options like userId or channelId
 * @param {object} [logger] - Logger instance
 * @author isahooman
 */
async function sendMessage(messageContent, targetType = null, filePath = null, options = {}, logger = null) {
  const client = getClient();
  // Check if the client exists before attempting to send the message
  if (!client) {
    process.stderr.write('Client is not ready yet. Queueing message.\n');
    queue.push({ messageContent, targetType, filePath, options, logger });
    return;
  }

  const { userId = null, channelId = null } = options;

  // Get owner IDs and other user lists from config
  const ownerId = configManager.getConfigValue('config', 'ownerId', []);
  const errorUsers = configManager.getConfigValue('config', 'errorUsers', []);
  const readyUsers = configManager.getConfigValue('config', 'readyUsers', []);
  const errorChannels = configManager.getConfigValue('config', 'errorChannels', []);
  const readyChannels = configManager.getConfigValue('config', 'readyChannels', []);

  // Determine recipient list based on targetType
  let recipients = [...ownerId];
  if (targetType === 'error' && errorUsers) recipients.push(...errorUsers);
  if (targetType === 'ready' && readyUsers) recipients.push(...readyUsers);

  // Add target user if provided and not already included
  if (userId && !recipients.includes(userId)) recipients.push(userId);

  try {
    // Send message to specific users
    for (const recipientId of recipients) await sendToUser(messageContent, recipientId, filePath, logger);

    // Send message to given channels
    if (channelId) await sendToChannel(messageContent, [channelId], filePath, options, logger);
    else if (targetType === 'error') await sendToChannel(messageContent, errorChannels, filePath, options, logger);
    else if (targetType === 'ready') await sendToChannel(messageContent, readyChannels, filePath, options, logger);
  } catch (error) {
    // If sending fails, add the message to the queue for retrying
    process.stderr.write(`Failed to send message, adding to queue: ${error}\n`);
    queue.push({ messageContent, targetType, filePath, options, logger });
    throw error; // Re-throw so caller can handle it
  }
}

/**
 * Sends a message to target users specified by Id.
 * @param {object} messageContent - The message content (embed or file path)
 * @param {string} userId - Target user Id
 * @param {string} [filePath] - The path to the file to send (optional)
 * @author isahooman
 */
async function sendToUser(messageContent, userId, filePath = null) {
  try {
    const client = getClient();
    const user = await client.users.fetch(userId);
    // If the user is not found do nothing
    if (!user) {
      process.stderr.write('Failed to find user to send message.\n');
      return;
    }

    // Store embeds and files in message options
    const messageOptions = { embeds: [], files: [] };
    // If an embed is included add it to the message options
    if (typeof messageContent === 'object' && messageContent instanceof EmbedBuilder) messageOptions.embeds.push(messageContent);
    // If a file path is provided, add it to the message
    if (filePath) messageOptions.files.push(filePath);

    // Send the message to the user
    await user.send(messageOptions);
    process.stdout.write(`Message sent to user: ${user.username}\n`);
  } catch (err) {
    process.stderr.write(`Failed to send message to user (ID: ${userId}): ${err}\n`);
  }
}

/**
 * Sends a message to target channels within the home guild specified by Id.
 * @param {object} messageContent - The message content
 * @param {string[]} channelIds - Array of target channel Ids
 * @param {string} [filePath] - The path to the file to send (optional)
 * @param {object} [options] - Additional options (e.g., needsVote)
 * @author isahooman
 */
async function sendToChannel(messageContent, channelIds, filePath = null, options = {}) {
  const client = getClient();
  const guildId = configManager.getConfigValue('config', 'guildId', null);
  const guild = client.guilds.cache.get(guildId);

  // If the guild is not found, do nothing
  if (!guild) {
    process.stderr.write('Failed to find home server to send message\n');
    return;
  }

  // Iterate through each channel ID
  for (const channelId of channelIds || []) try {
    const channel = guild.channels.cache.get(channelId);
    // If the channel is not found, continue to the next channel
    if (!channel) {
      process.stderr.write(`Failed to find channel (ID: ${channelId}) to send message\n`);
      continue;
    }

    // Store embeds and files in message options
    const messageOptions = { embeds: [], files: [] };
    // If an embed is included add it to the message options
    if (typeof messageContent === 'object' && messageContent instanceof EmbedBuilder) messageOptions.embeds.push(messageContent);
    // If a file path is provided, add it to the message
    if (filePath) messageOptions.files.push(filePath);

    // Send the message to the channel
    const sentMessage = await channel.send(messageOptions);
    process.stdout.write(`Message sent to channel: ${channel.name}\n`);

    // If this is a suggestion, add voting reactions
    if (options.needsVote) {
      await sentMessage.react('✅');
      await sentMessage.react('❎');
      process.stdout.write(`Added voting reactions to message in channel: ${channel.name}\n`);
    }
  } catch (err) {
    process.stderr.write(`Failed to send message to channel (ID: ${channelId}): ${err}\n`);
  }
}

// ===========================================================
// Preparation
// ===========================================================

/**
 * Sends a notification that the bot is ready
 * @param {string} message Notification message
 * @param {object} [logger] Logger instance
 * @author isahooman
 */
async function sendReadyNotification(message, logger = null) {
  // Create an embed to notify that the bot has started
  const startEmbed = new EmbedBuilder()
    .setColor('#17d5ad')
    .setTitle('Bot Ready!')
    .setDescription(message);

  // Send the ready embed
  await sendMessage(startEmbed, 'ready', null, {}, logger);
}

/**
 * Sends an error report to configured users and channels
 * @param {string} messageText Error message text
 * @param {string} commandType Command type (slash, prefix, etc.)
 * @param {object} commandInfo Additional command information
 * @param {object} [logger] Logger instance
 * @author isahooman
 */
async function sendErrorReport(messageText, commandType = 'unknown', commandInfo = {}, logger = null) {
  if (messageText.startsWith('Shutdown because:')) {
    process.stdout.write(`Shutdown detected, skipping error report\n`);
    return;
  }

  // Gather error information
  let errorEmbed = new EmbedBuilder().setColor('#FF0000');
  let errorTitle = 'Error';
  let errorStack = '';
  let errorMessage = '';
  let errorFile = null;

  try {
    // Prepare error report for slash commands
    if (commandType === 'slash' && commandInfo.interaction) {
      const interaction = commandInfo.interaction;

      errorTitle = `Error in slash command: ${interaction.commandName}`;
      errorEmbed.setTitle(errorTitle);
      errorMessage = messageText;
      const options = interaction.options?.data || [];
      const args = options.map(opt => `\`${opt.name}\`: ${opt.value}`).join('\n') || 'None';

      errorEmbed.addFields(
        { name: 'User', value: interaction.user ? `${interaction.user.username} <@${interaction.user.id}>` : 'N/A' },
        { name: 'Channel', value: interaction.channelId ? `<#${interaction.channelId}> (ID: ${interaction.channelId})` : 'N/A' },
        { name: 'Server', value: interaction.guild ? `${interaction.guild.name} | ${interaction.guild.id}` : 'N/A' },
        { name: 'Arguments', value: args },
        { name: 'Error', value: `\`\`\`\n${messageText}\n\`\`\`` },
      );

    // Prepare error report for prefix commands
    } else if (commandType === 'prefix' && commandInfo.context) {
      const context = commandInfo.context;

      const commandName = commandInfo.command || 'unknown';

      errorTitle = `Error in prefix command: ${commandName}`;
      errorMessage = messageText;

      errorEmbed.setTitle(errorTitle);
      errorEmbed.addFields(
        { name: 'Server', value: context.guild ? `${context.guild.name} | ${context.guild.id}` : 'N/A' },
        { name: 'User', value: context.author ? `<@${context.author.id}> | ${context.author.username}` : 'N/A' },
        { name: 'Channel', value: context.channel ? `<#${context.channel.id}> | ID: ${context.channel.id}` : 'N/A' },
        { name: 'Arguments', value: Array.isArray(commandInfo.args) ? commandInfo.args.join(' ') : 'None' },
        { name: 'Error', value: `\`\`\`\n${messageText}\n\`\`\`` },
      );
    } else {
      errorEmbed.addFields(
        { name: 'Message', value: messageText },
      );
    }

    // Get stack trace from passed commandInfo
    if (commandInfo.error) errorStack = commandInfo.error.stack;
    else if (commandInfo.stack) errorStack = commandInfo.stack;
    else if (commandType === 'slash' && commandInfo.interaction) errorStack = commandInfo.interaction.stack;
    else if (commandType === 'prefix' && commandInfo.context) errorStack = commandInfo.context.stack;

    // Write a report file for command error stack
    if (commandType === 'slash' || commandType === 'prefix') {
      // Ensure the error directory exists
      if (!fs.existsSync(errorDir)) fs.mkdirSync(errorDir, { recursive: true });

      // Create a filename with date-time and error details
      const timestamp = moment().format('YYYY-MM-DD_HH-mm');
      let cmdName = 'unknown';

      if (commandType === 'slash' && commandInfo.interaction) cmdName = commandInfo.interaction.commandName;
      else if (commandType === 'prefix') cmdName = commandInfo.command || 'unknown';

      // Create the error file path
      errorFile = path.join(errorDir, `${timestamp}_${commandType}_${cmdName}.js`);
      const content = `Error: ${errorMessage}\n\nStack Trace:\n${errorStack}`;

      // Write the error stack to the file
      await fs.promises.writeFile(errorFile, content, 'utf-8');
    }

    await sendMessage(errorEmbed, 'error', errorFile, {}, logger);
  } catch (error) {
    process.stderr.write(`Error sending error report:\n${error}\n`);
  }
}

/**
 * Send a bug report to configured channels
 * @param {string} message Bug report message
 * @param {object} context Additional context (author, guild, channel)
 * @param {object} [logger] Logger instance
 * @returns {boolean} Success status
 * @author isahooman
 */
async function sendBugReport(message, context = {}, logger = null) {
  const user = context.author;
  if (!user) {
    if (logger) logger.error('[Bug Report] Missing author in context');
    else process.stderr.write('[Bug Report] Missing author in context');
    return false;
  }

  if (logger) logger.debug(`[Bug Report] Bug report submitted by: ${user.username}, Message: ${message}`);
  else process.stdout.write(`[Bug Report] Bug report submitted by: ${user.username}, Message: ${message}`);

  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('Bug Report')
    .addFields(
      { name: 'Server', value: context.guild ? `${context.guild.name} | ${context.guild.id}` : 'N/A' },
      { name: 'User', value: `<@${user.id}> | ${user.username}` },
      { name: 'Channel', value: context.channel ? `<#${context.channel.id}> | ID: ${context.channel.id}` : 'N/A' },
      { name: 'Message', value: message },
    )
    .setTimestamp();

  try {
    const bugReportChannels = configManager.getConfigValue('config', 'bugReportChannels', []);

    if (!bugReportChannels.length) {
      if (logger) logger.warn('[Bug Report] No bug report channels configured');
      return false;
    }

    // Queue the bug report for each channel
    for (const channelId of bugReportChannels) {
      await sendMessage(embed, null, null, { channelId }, logger);
      if (logger) logger.info(`[Bug Report] Bug report queued for channel ${channelId}`);
      else process.stdout.write(`[Bug Report] Bug report queued for channel ${channelId}`);
    }

    return true;
  } catch (error) {
    if (logger) logger.error(`[Bug Report] Error processing bug report: ${error.message}`);
    else process.stderr.write(`[Bug Report] Error processing bug report: ${error.message}`);
    return false;
  }
}

/**
 * Send a suggestion to configured channels
 * @param {string} message Suggestion message
 * @param {object} context Additional context (author, guild, channel)
 * @param {object} [logger] Logger instance
 * @returns {boolean} Success status
 * @author isahooman
 */
async function sendSuggestion(message, context = {}, logger = null) {
  const user = context.author;
  if (!user) {
    if (logger) logger.error('[Suggestion] Missing author in context');
    else process.stderr.write('[Suggestion] Missing author in context');
    return false;
  }

  if (logger) logger.debug(`[Suggestion] Suggestion submitted by: ${user.username}, Message: ${message}`);
  else process.stdout.write(`[Suggestion] Suggestion submitted by: ${user.username}, Message: ${message}`);

  const embed = new EmbedBuilder()
    .setColor('#91c2af')
    .setTitle('Suggestion')
    .addFields(
      { name: 'Server', value: context.guild ? `${context.guild.name} | ${context.guild.id}` : 'N/A' },
      { name: 'User', value: `<@${user.id}> | ${user.username}` },
      { name: 'Channel', value: context.channel ? `<#${context.channel.id}> | ID: ${context.channel.id}` : 'N/A' },
      { name: 'Suggestion', value: message },
    )
    .setTimestamp();

  try {
    const suggestChannels = configManager.getConfigValue('config', 'suggestChannels', []);

    if (!suggestChannels.length) {
      if (logger) logger.warn('[Suggestion] No suggestion channels configured');
      return false;
    }

    // Queue the suggestion for each channel
    for (const channelId of suggestChannels) {
      await sendMessage(embed, null, null, { channelId, needsVote: true }, logger);
      if (logger) logger.info(`[Suggestion] Suggestion queued for channel ${channelId}`);
      else process.stdout.write(`[Suggestion] Suggestion queued for channel ${channelId}`);
    }

    return true;
  } catch (error) {
    if (logger) logger.error(`[Suggestion] Error processing suggestion: ${error.message}`);
    else process.stderr.write(`[Suggestion] Error processing suggestion: ${error.message}`);
    return false;
  }
}

ensureErrorDirectory();
startQueueMonitor();

module.exports = {
  sendErrorReport,
  sendReadyNotification,
  sendBugReport,
  sendSuggestion,
};

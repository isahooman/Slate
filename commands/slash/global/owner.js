const { SlashCommandBuilder, REST, Routes } = require('discord.js');
const { ownerId, clientId, token } = require('../../../config.json');
const logger = require('../../../logger.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('owner')
        .setDescription('Owner exclusive commands.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Select a command')
                .setRequired(true)
                .addChoices(
                    { name: 'Logs', value: 'logs' },
                    { name: 'Deploy', value: 'deploy' },
                    { name: 'Reboot', value: 'reboot' },
                    { name: 'Reload', value: 'reload' },
                    { name: 'Clear', value: 'clear' },
                    { name: 'Fail', value: 'fail' },
                ))
        .addStringOption(option => option.setName('scope')
          .setDescription('Scope of clear command')
          .setRequired(false)
          .addChoices(
            { name: 'Self', value: 'self' },
            { name: 'All', value: 'all' }))
        .addIntegerOption(option => option.setName('lines')
            .setDescription('Number of lines to send for logs command')
            .setRequired(false)),
        async execute(interaction) {
        if (interaction.user.id !== ownerId) {
            return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: false });
        }

        const selectedCommand = interaction.options.getString('command');

        switch (selectedCommand) {
            case 'logs': {
                  try {
                    const linesToRetrieve = interaction.options.getInteger('lines') || 25;
                    if (linesToRetrieve <= 0) {
                      return interaction.reply('Please enter a valid number of lines to retrieve (greater than 0).');
                    }
                    const logFilePath = path.join(__dirname, '..', '..', '..', 'bot.lo');
                    const logData = fs.readFileSync(logFilePath, 'utf8');
                    const logLines = logData.split('\n').slice(-linesToRetrieve).join('\n');
                    await interaction.reply(`Here are the last ${linesToRetrieve} lines of cluster logs:\n\`\`\`\n${logLines}\n\`\`\``);
                  } catch (error) {
                    logger.error(error);
                    await interaction.reply('An error occurred while reading the logs.');
                  }
                  break;
                }
                case 'deploy': {
                  await interaction.reply('Started refreshing application commands: <a:loading:1167519412497162281>');
                  // Deploy global commands
                  const globalCommands = [];
                  const globalCommandFiles = fs.readdirSync('./commands/slash/global').filter(file => file.endsWith('.js'));
                  for (const file of globalCommandFiles) {
                      const command = require(`../commands/slash/global/${file}`);
                      globalCommands.push(command.data.toJSON());
                  }
                  // Deploy dve commands
                  const guildCommands = [];
                  const guildCommandFiles = fs.readdirSync('../../../commands/slash/dev').filter(file => file.endsWith('.js'));
                  for (const file of guildCommandFiles) {
                      const command = require(`../../../commands/slash/dev/${file}`);
                      guildCommands.push(command.data.toJSON());
                  }
                  const rest = new REST({ version: '10' }).setToken(token);
                  try {
                      // Delete existing global commands
                      const existingGlobalCommands = await rest.get(Routes.applicationCommands(clientId));
                      for (const command of existingGlobalCommands) {
                          await rest.delete(Routes.applicationCommand(clientId, command.id));
                      }
                      // redeploy global slash commands
                      await rest.put(Routes.applicationCommands(clientId), { body: globalCommands });
                      logger.info('Successfully re-registered global application commands.');
                      // Deploy dev slash commands
                      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: guildCommands });
                      logger.info(`Successfully re-registered guild-specific commands for guildId: ${guildId}`);
              
                      await interaction.editReply('Successfully re-registered all application commands: <:verified:1167520802044919818>');
                  } catch (error) {
                      logger.error(error);
                      await interaction.followUp('Failed to update commands!');
                  }
                  break;
              }            
              case 'reboot': {
                  await interaction.reply('Restarting...');
                  interaction.client.destroy();
                  process.exit(0);
                  break;
                }
              case 'reload': {
                const commandDirectories = 
                {
                    'dev': '../../../commands/slash/dev',
                    'global': '../../../commands/slash/global'
                };
              
                  for (const [key, value] of Object.entries(commandDirectories)) {
                      const commandFiles = fs.readdirSync(path.join(__dirname, value)).filter(file => file.endsWith('.js'));
                      for (const file of commandFiles) {
                          try {
                              const fullPath = path.join(__dirname, value, file);
                              delete require.cache[require.resolve(fullPath)];
                              const newCommand = require(fullPath);
                              interaction.client.commands.set(newCommand.data.name, newCommand);
                              logger.info(`Reloaded ${key} command: ${file}`);
                          } catch (error) {
                              logger.error(`Failed to reload ${key} command "${file}": ${error.message}`);
                          }
                      }
                  }
                  await interaction.reply({ content: 'All commands have been reloaded!', ephemeral: false });
                  break;
              }                       
              case 'clear': {
                const clearOption = interaction.options.getString('scope') || 'self';
            
                try {
                    const fetchedMessages = await interaction.channel.messages.fetch({ limit: 100 });
                    let deletableMessages;
            
                    if (clearOption === 'self') {
                        deletableMessages = fetchedMessages.filter(message => message.author.id === interaction.client.user.id);
                    } else if (clearOption === 'all') {
                        const prefixes = 
                        [
                          '-', 't!', 't@', '!', '+', '_', ';', '.', '?', 's?', 'p!', 'r.', 'do.', 
                          '-', '$$', '&&', 'a!', 'b!', 'c!', 'd!', 'e!', 'f!', 'g!', 'h!', 'i!', 
                          'j!', 'k!', 'l!', 'm!', 'n!', 'o!', 'p!', 'q!', 'r!', 's!', 't!', 'u!', 
                          'v!', 'w!', 'x!', 'y!', 'z!', '/', '//', '\\', '=', '>', '->', '`', ',', 
                          '|', '[', ']', 'ay!', 'r-', '^<@!?${client.user.id}>'
                        ];
                        deletableMessages = fetchedMessages.filter(message => 
                            message.author.bot || prefixes.some(prefix => message.content.startsWith(prefix))
                        );
                    } else {
                        return interaction.reply({ content: 'Invalid clear option provided.', ephemeral: true });
                    }
            
                    const messagesToDelete = deletableMessages.filter(msg => msg.createdTimestamp > (Date.now() - 180000));
                    await interaction.channel.bulkDelete(messagesToDelete, true);
            
                    logger.info(`Bulk deleted ${messagesToDelete.size} messages.`);
                    const reply = await interaction.reply(`Cleared ${messagesToDelete.size} messages.`);
            
                    setTimeout(() => reply.delete(), 5000);
                } catch (error) {
                    logger.error(error);
                    await interaction.reply('An error occurred while deleting messages.');
                }
                break;
            }                          
              case 'fail': {
                  try {
                      throw new Error('Forced failure for testing purposes');
                  } catch (error) {
                      logger.error(error.message);
                      throw error;
                  }
                  break;
              }               
            default:
                await interaction.reply({ content: 'Invalid command selected.', ephemeral: true });
        }
    },
};
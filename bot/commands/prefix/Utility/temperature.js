const { EmbedBuilder } = require('discord.js');
const logger = require('../../../components/util/logger.js');

module.exports = {
  name: 'temperature',
  usage: 'temperature <scale> <temperature>',
  category: 'Utility',
  aliases: ['temp'],
  allowDM: true,
  description: 'convert temperature between different scales.',
  execute(message) {
    const args = message.content.split(' ').slice(1);
    if (args.length !== 2) {
      logger.warn(`[Temperature Command] Invalid usage! Please use: ${this.usage}`);
      return message.channel.send(`Invalid usage! Please use:\n \`${this.usage}\``);
    }

    // Get the scale from the first argument
    const scale = args[0].toLowerCase();
    // Get the temperature from the second argument
    const temperature = parseFloat(args[1]);

    // Check if the temperature is a valid number.
    if (isNaN(temperature)) {
      logger.warn('[Temperature Command] Invalid temperature input.');
      return message.channel.send('Please provide a valid temperature.');
    }

    let celsius, fahrenheit, kelvin;

    switch (scale.toLowerCase()) { // Switch to the provided scale
      case 'c': // If the scale is Celsius
      case 'celsius':
        celsius = temperature;
        fahrenheit = (temperature * 9) / 5 + 32;
        kelvin = temperature + 273.15;
        break;
      case 'f': // If the scale is Fahrenheit.
      case 'fahrenheit':
        celsius = (temperature - 32) * 5 / 9;
        fahrenheit = temperature;
        kelvin = (temperature - 32) * 5 / 9 + 273.15;
        break;
      case 'k': // If the scale is Kelvin.
      case 'kelvin':
        celsius = temperature - 273.15;
        fahrenheit = (temperature - 273.15) * 9 / 5 + 32;
        kelvin = temperature;
        break;
      default: // If the scale is invalid.
        logger.warn(`[Temperature Command] Invalid scale provided: ${scale}.`);
        return message.channel.send(`Invalid scale: \`${scale}\`, Please use one of the following:\n- Celsius | C\n- Fahrenheit | F\n- Kelvin | K`);
    }

    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`Temperature: ${temperature}°${scale.toUpperCase()}`)
      .addFields(
        { name: 'Celsius (°C)', value: `${celsius.toFixed(2)}`, inline: true },
        { name: 'Fahrenheit (°F)', value: `${fahrenheit.toFixed(2)}`, inline: true },
        { name: 'Kelvin (K)', value: `${kelvin.toFixed(2)}`, inline: true },
      );

    message.channel.send({ embeds: [embed] });
  },
};

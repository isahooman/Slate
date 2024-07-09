module.exports = {
  name: 'number',
  usage: 'number <min> <max>',
  category: 'fun',
  aliases: ['rng'],
  allowDM: true,
  description: 'Generate a random number within a given range',

  // The function that executes the command.
  execute(message, args) {
    // Parse the minimum and maximum values from the command arguments.
    let min = parseInt(args[0]);
    let max = parseInt(args[1]);

    // If no arguments are provided, default to a range of 1-100.
    if (isNaN(min) || isNaN(max)) { min = 1; max = 100; }

    // Ensure the minimum value is less than or equal to the maximum value.
    if (min > max) return message.channel.send('The minimum number must be less than or equal to the maximum number!');

    // Generate a random number within the specified range.
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    // Reply with the random number.
    message.channel.send(`Your lucky number is: **${randomNumber}**`);
  },
};

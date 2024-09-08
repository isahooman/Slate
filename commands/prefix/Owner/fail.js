module.exports = {
  name: 'fail',
  usage: 'fail',
  category: 'Owner',
  allowDM: true,
  description: 'Intentionally throw an error for testing.',
  cooldowns: {
    user: 2500,
    guild: 5000,
    global: 10000,
  },
  execute() {
    // Intentional failure
    throw Error('This is a test error.');
  },
};

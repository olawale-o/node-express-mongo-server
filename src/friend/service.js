const reposittory = require('./repository');

module.exports = {
  friendSuggestions: async (filter) => reposittory.friendSuggestions(filter),
};

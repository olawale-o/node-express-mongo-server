const reposittory = require('./repository');

module.exports = {
  friendSuggestions: async (filter) => reposittory.friendSuggestions(filter),
  addFriend: async (filter) => reposittory.addFriend(filter),
};

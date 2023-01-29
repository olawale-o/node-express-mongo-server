/* eslint-disable import/no-extraneous-dependencies */
const { ObjectID } = require('bson');

const reposittory = require('./repository');

module.exports = {
  friendSuggestions: async (filter) => reposittory.friendSuggestions(filter),
  addFriend: async ({ from, to }) => {
    const friendLimit = 2;
    const friendCount = await reposittory.findOne({
      $and: [
        { from: ObjectID(from) },
        { bucketSize: { $lt: friendLimit } },
      ],
    });
    if (!friendCount) {
      await reposittory.insertOne(
        { from: ObjectID(from), friends: [ObjectID(to)], bucketSize: 1 },
      );
    } else {
      await reposittory.updateOne(
        { from: ObjectID(from) },
        { $push: { friends: ObjectID(to) }, $inc: { bucketSize: 1 } },
      );
    }
  },
};

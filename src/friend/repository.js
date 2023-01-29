/* eslint-disable import/no-extraneous-dependencies */
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');
const config = require('../../config');

const client = new MongoClient(config.get('db.host'));

const User = client.db(config.get('db.name')).collection('users');
const Friend = client.db(config.get('db.name')).collection('friends');

module.exports = {
  friendSuggestions: async ({ userId }) => (
    User.aggregate([
      {
        $match: {
          _id: { $ne: ObjectID(userId) },
        },
      },
      {
        $project: {
          username: 1,
          avatar: 1,
          id: '$_id',
        },
      },
    ]).toArray()
  ),
  addFriend: async ({ from, to }) => {
    const friendLimit = 2;
    const friendCount = await Friend.findOne({
      $and: [
        { from: ObjectID(from) },
        { bucketSize: { $lt: friendLimit } },
      ],
    });
    if (!friendCount) {
      await Friend.insertOne(
        { from: ObjectID(from), friends: [ObjectID(to)], bucketSize: 1 },
      );
    } else {
      await Friend.updateOne(
        { from: ObjectID(from) },
        { $push: { friends: ObjectID(to) }, $inc: { bucketSize: 1 } },
      );
    }
  },
};

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
  findOne: async (filter) => Friend.findOne(filter),
  insertOne: async (filter) => Friend.insertOne(filter),
  updateOne: async (filter) => Friend.updateOne(filter),
};

/* eslint-disable import/no-extraneous-dependencies */
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');
const config = require('../../config');

const client = new MongoClient(config.get('db.host'));

const User = client.db(config.get('db.name')).collection('users');

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
};

/* eslint-disable import/no-extraneous-dependencies */
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');
const config = require('../../config');

const client = new MongoClient(config.get('db.host'));

const User = client.db(config.get('db.name')).collection('users');

module.exports = {
  create: async (credentials) => User.insertOne(credentials),
  findByUsername: async ({ username }) => User.findOne({ username }),
  findById: async ({ id }) => User.findOne({ _id: ObjectID(id) }),
  findByIdAndUpdate: async (id, operation, options = {}) => (
    User.findOneAndUpdate({ _id: ObjectID(id) }, operation, options)
  ),
  findAllUsers: async (options) => User.find(options).toArray(),
  findByUsernameOrEmail: async ({ username }) => (
    User.findOne(
      { $or: [{ email: username }, { username }] },
    )
  ),
  findUserBy: async (options) => User.findOne(options),
};

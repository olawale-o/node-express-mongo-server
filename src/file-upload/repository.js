/* eslint-disable import/no-extraneous-dependencies */
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');
const config = require('../../config');

const client = new MongoClient(config.get('db.host'));

const Upload = client.db(config.get('db.name')).collection('uploads');

module.exports = {
  insertOne: async ({ uploader, url }) => Upload.insertOne({ uploader: ObjectID(uploader), url }),
};

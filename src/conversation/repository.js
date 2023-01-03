const { MongoClient } = require('mongodb');
const config = require('../../config');

const client = new MongoClient(config.get('db.host'));

const Conversation = client.db(config.get('db.name')).collection('conversations');

module.exports = {
  insertOne: async (body) => Conversation.insertOne(body),
  findConversation: async (pipeline) => Conversation.aggregate(pipeline).toArray(),
};

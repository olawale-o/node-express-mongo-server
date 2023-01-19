/* eslint-disable import/no-extraneous-dependencies */
const { ObjectID } = require('bson');

const repo = require('./repository');

module.exports = {
  newChat: async (body) => {
    const { from, to, text } = body;
    await repo.insertOne({
      from: ObjectID(from),
      to: ObjectID(to),
      text,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    });
  },
  chats: async (body) => {
    const { socketId, userId } = body;
    return repo.findConversation([
      {
        $match: {
          $or: [
            { $and: [{ from: ObjectID(socketId) }, { to: ObjectID(userId) }] },
            { $and: [{ from: ObjectID(userId) }, { to: ObjectID(socketId) }] },
          ],
        },
      }]);
  },
};

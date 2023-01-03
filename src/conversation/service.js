const repo = require('./repository');

module.exports = {
  newChat: async (body) => {
    const { from, to, text } = body;
    await repo.insertOne({
      from,
      to,
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
            { $and: [{ from: socketId }, { to: userId }] },
            { $and: [{ from: userId }, { to: socketId }] },
          ],
        },
      }]);
  },
};

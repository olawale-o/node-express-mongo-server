/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');
const config = require('./config');
const conversationService = require('./src/conversation/service');

const client = new MongoClient(config.get('db.host'));

const User = client.db(config.get('db.name')).collection('users');

const sessions = new Map();
const messages = [];

const findSession = (id) => sessions.get(id);

const saveSession = (id, session) => sessions.set(id, session);

const findSessions = () => [...sessions.values()];

// const saveMessages = (message) => messages.push(message);

const findMessagesForUser = (userId) => (
  messages.filter((message) => message.from === userId || message.to === userId)
);

const getMessagesForUser = (userId) => {
  const messagesPerUser = new Map();
  findMessagesForUser(userId).forEach((message) => {
    const { from, to } = message;
    const otherUser = userId === from ? to : from;
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message);
    } else {
      messagesPerUser.set(otherUser, [message]);
    }
  });
  return messagesPerUser;
};

module.exports = function scoketConnection(IO) {
  IO.use(async (socket, next) => {
    const { sessionId } = socket.handshake.auth;
    if (sessionId) {
      const session = await findSession(sessionId);
      if (session) {
        socket.sessionId = sessionId;
        socket.userId = session.userId;
        socket.username = session.username;
        // socket._id = session.id;
        return next();
      }
      return next(new Error('Invalid session'));
    }
    const { user } = socket.handshake.auth;
    if (!user) {
      return next(new Error('invalid user details'));
    }
    socket.username = user.username;
    socket.userId = user.id;
    socket.sessionId = user.id;
    // socket._id = user.id;
    return next();
  });

  IO.on('connection', async (socket) => {
    saveSession(socket.sessionId, {
      userId: socket.userId,
      username: socket.username,
      // _id: socket._id,
      online: true,
    });
    await socket.join(socket.userId);
    const users = [];
    const userMessages = getMessagesForUser(socket.userId);
    findSessions().forEach((session) => {
      if (session.userId !== socket.userId) {
        users.push({
          userId: session.userId,
          username: session.username,
          online: session.online,
          // _id: socket._id,
          messages: userMessages.get(session.userId) || [],
        });
      }
    });

    // connect to database and update user online status
    await User.findOneAndUpdate(
      { _id: ObjectID(socket.userId) },
      { $set: { online: true } },
      { returnDocument: 'after' },
    );
    await socket.emit('session', {
      sessionId: socket.sessionId,
      userId: socket.userId,
      username: socket.username,
      // _id: socket._id,
    });
    // all connected users

    // get all user's follower online
    const onlineFollowers = await User.find({ _id: { $ne: ObjectID(socket.userId) } }).toArray();
    socket.emit('users', onlineFollowers);

    await socket.broadcast.emit('user connected', {
      userId: socket.userId,
      username: socket.username,
      sessionId: socket.sessionId,
      // id: socket.id,
    });

    socket.on('private message', async ({ text, to }) => {
      const newMessage = {
        from: ObjectID(socket.userId),
        to: ObjectID(to),
        text,
        username: socket.username,
      };
      await conversationService.newChat({ from: socket.userId, to, text });
      socket.to(to).emit('private message', newMessage);
      // saveMessages(newMessage);
    });

    socket.on('user messages', async ({ _id, username }) => {
      const dbMessages = await conversationService.chats({ socketId: socket.userId, userId: _id });
      // const userMessages = getMessagesForUser(socket.id);
      socket.emit('user messages', {
        userId: _id,
        id: _id,
        username,
        messages: dbMessages || [], // userMessages.get(id) || []
      });
    });

    socket.on('disconnect', async () => {
      const matchingSockets = await IO.in(socket.userId).allSockets();
      const isDisconnected = matchingSockets.size === 0;
      if (isDisconnected) {
        await User.findOneAndUpdate({ _id: ObjectID(socket.userId) }, { $set: { online: false } });
        socket.broadcast.emit('user disconnected', {
          userId: socket.userId,
          username: socket.username,
        });
        saveSession(socket.sessionId, {
          userId: socket.userId,
          username: socket.username,
          connected: socket.connected,
        });
      }
    });
  });
};

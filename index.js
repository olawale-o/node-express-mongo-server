const http = require('http');
const { Server } = require('socket.io');

const config = require('./config');
const client = require('./src/database')(config.get('db.host'));
const dbConnection = require('./src/database/connection');
const app = require('./src/app');
const socketConnection = require('./socketConnection');
const handleError = require('./src/common/error-handler');

const server = http.createServer(app);

const IO = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

socketConnection(IO);

dbConnection(client, config.get('db.name'))
  .then((result) => {
    console.log(result);
    server.listen(parseInt(config.get('port'), 10), () => {
      console.log(`Server started on port ${config.get('port')}`);
    });
  })
  .catch(console.log)
  .finally(() => client.close());

process.on('uncaughtException', (error) => {
  handleError(error);
  if (!error.isOperational) {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  client.close();
});

module.exports = server;

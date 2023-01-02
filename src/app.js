const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const handleError = require('./common/error-handler');
const AppError = require('./common/app-error');

const corsOption = {
  origin: 'http://localhost:3000',
  credential: true,
};

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOption));

app.get('/subscribe', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  });
  // res.flushHeaders();
  res.write('event: connected\n');
  res.write('id: 1\n');
  res.write('data: You are now subscribed!\n');
  res.write('\n\n');

  req.on('close', () => res.end('OK'));
});

app.use('/api/v1/fileupload', require('./file-upload'));
app.use('/api/v1/users', require('./user'));

// eslint-disable-next-line no-unused-vars
app.use(async (err, _req, res, _next) => {
  await handleError(err, res);
});

app.use((err, req, res, next) => {
  if (!err) {
    return next(new AppError(404, 'Not found'));
  }
  return next();
});

process.on('uncaughtException', (error) => {
  handleError(error);
  if (!error.isOperational) {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('graceful shutdown');
});

module.exports = app;

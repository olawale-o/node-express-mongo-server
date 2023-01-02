const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const handleError = require('./common/error-handler');

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

app.use('/api/v1', (_req, res) => {
  res.status(200).json({
    message: 'connected successfully',
  });
});

app.use(async (err, _req, res) => {
  await handleError(err, res);
});

process.on('uncaughtException', (error) => {
  handleError(error);
});

process.on('SIGTERM', () => {
  console.log('graceful shutdown');
});

module.exports = app;

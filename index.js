const http = require('http');
const config = require('./config');
const client = require('./src/database')(config.get('db.host'));
const dbConnection = require('./src/database/connection');
const app = require('./src/app');

const server = http.createServer(app);

dbConnection(client, config.get('db.name'))
  .then((result) => {
    console.log(result);
    server.listen(parseInt(config.get('port'), 10), () => {
      console.log(`Server started on port ${config.get('port')}`);
    });
  })
  .catch(console.log)
  .finally(() => client.close());

module.exports = server;

const convict = require('convict');

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 5000,
    env: 'PORT',
    arg: 'port',
  },
  db: {
    host: {
      doc: 'Database host name',
      format: '*',
      default: 'mongodb://localhost:27017/generaldb?retryWrites=true&w=majority',
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'generaldb',
    },
  },
});

const env = config.get('env');
config.loadFile(`./config/${env}.json`);

config.validate({ allowed: 'strict' });

module.exports = config;
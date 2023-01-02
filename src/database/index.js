const { MongoClient } = require('mongodb');

module.exports = function client(uri) {
  return new MongoClient(uri);
};

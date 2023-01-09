const uploadRepo = require('./repository');

module.exports = {
  newUpload: async (data) => uploadRepo.insertOne(data),
};

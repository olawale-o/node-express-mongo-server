const multer = require('multer');

const storage = multer.memoryStorage();
const multerUploads = multer({ storage });

module.exports = multerUploads;

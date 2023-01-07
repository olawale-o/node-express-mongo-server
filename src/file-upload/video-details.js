const path = require('path');
const fs = require('fs');

const getFileSizeAndResolvedPath = (filePath) => {
  const resolvePath = path.resolve(filePath);
  const stat = fs.statSync(resolvePath);
  return {
    fileSize: stat.size, resolvePath,
  };
};

module.exports = getFileSizeAndResolvedPath;

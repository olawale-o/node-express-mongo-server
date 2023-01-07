const fs = require('fs');
const getFileSizeAndResolvedPath = require('./video-details');
const getChunkProps = require('./video-chunk');

module.exports = {
  create: (req, res, next) => {
    try {
      console.log(req.file);
      return res.status(200).json({
        message: 'Success',
      });
    } catch (e) {
      console.log(e);
      return next(e);
    }
  },
  getVideo: (req, res) => {
    const { fileSize, resolvePath } = getFileSizeAndResolvedPath('asset/microservice.mp4');
    const requestRangeHeader = req.headers.range;

    if (!requestRangeHeader) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(resolvePath).pipe(res);
    } else {
      const { start, end, chunkSize } = getChunkProps(requestRangeHeader, fileSize);

      // Read only part of the file from "start" to "end"
      const readStream = fs.createReadStream(resolvePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      readStream.pipe(res);
    }
  },
};

const Datauri = require('datauri/parser');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary');

const config = require('../../config');

const getFileSizeAndResolvedPath = require('./video-details');
const getChunkProps = require('./video-chunk');

const AppError = require('../common/app-error');

const cloudinaryService = require('../services/cloudinary-service');
const uploadService = require('./service');

const dUri = new Datauri();
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
  newVideoUpload: async (req, res, next) => {
    const { id } = req.params;
    console.log(req.file.buffer);
    try {
      const uploder = async (fileContent) => cloudinaryService.uploadFromBuffer(fileContent);
      const fileContent = dUri.format(
        path.extname(req.file.originalname).toString(),
        req.file.buffer,
      ).content;
      const result = await uploder(fileContent);
      console.log(result);
      await uploadService.newUpload({ uploader: id, url: result.secure_url });
      return res.status(200).json({
        message: 'File uploaded succesfully',
        url: result.secure_url,
      });
    } catch (error) {
      return next(new AppError(500, 'Internal server error'));
    }
  },
  getSignature: async (_req, res, next) => {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = cloudinary.utils.api_sign_request({
        timestamp,
      }, config.get('cloudinary.api_secret'));
      return res.status(200).json({ timestamp, signature });
    } catch (e) {
      return next(e);
    }
  },
};

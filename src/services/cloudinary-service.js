const cloudinary = require('cloudinary');
const streamifier = require('streamifier');

const config = require('../../config');

cloudinary.config({
  cloud_name: config.get('cloudinary.cloud_name'),
  api_key: config.get('cloudinary.api_key'),
  api_secret: config.get('cloudinary.api_secret'),
});

module.exports = {
  fileUploader: (file, folder = 'chats', resourceType = 'auto') => new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(file, { resource_type: resourceType, folder: `${folder}/` })
      .then((result) => resolve(result))
      .catch(() => {
        reject(new Error('Unable to upload file at this time'));
      });
  }),
  fileLargeUploader: (file, folder = 'chats', resourceType = 'auto') => new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload_large(
      file,
      {
        resource_type: resourceType,
        chunk_size: 6000000,
        folder: `${folder}/`,
      },
      (err, result) => {
        if (err) reject(new Error('Unable to upload file at this time'));
        resolve(result);
      },
    );
  }),
  uploadFromBuffer: (buffer) => new Promise((resolve, reject) => {
    const cldUploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'chats',
        resource_type: 'video',
        chunk_size: 6000000,
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          console.log(error);
          reject(error);
        }
      },
    );

    streamifier.createReadStream(buffer).pipe(cldUploadStream);
  }),
};

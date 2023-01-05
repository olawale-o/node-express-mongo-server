const cloudinary = require('cloudinary');

const config = require('../../config');

cloudinary.config({
  cloud_name: config.get('cloudinary.cloud_name'),
  api_key: config.get('cloudinary.api_key'),
  api_secret: config.get('cloudinary.api_secret'),
});

module.exports = {
  fileUploader: (file, folder = 'chats') => new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(file, { resource_type: 'auto', folder: `${folder}/` })
      .then((result) => resolve(result))
      .catch((error) => {
        console.log(error);
        reject(new Error('Unable to upload file at this time'));
      });
  }),
};
